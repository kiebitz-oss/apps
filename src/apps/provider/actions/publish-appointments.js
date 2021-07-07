// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes, sign } from 'helpers/crypto';

export async function publishAppointments(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');
    const properties = settings.get('appointmentProperties');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('publishAppointments');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );

        const signedAppointments = [];
        const relevantAppointments = openAppointments.filter(
            oa => new Date(oa.timestamp) > new Date() && oa.slotData.length > 0
        );

        for (const appointment of relevantAppointments) {
            try {
                const convertedAppointment = {
                    id: appointment.id,
                    duration: appointment.duration,
                    timestamp: appointment.timestamp,
                    publicKey: keyPairs.encryption.publicKey,
                    properties: {},
                    // to do: remove filter once everything's on the new mechanism
                    slotData: appointment.slotData.map(sl => ({
                        id: sl.id,
                        open: sl.open,
                    })),
                };
                for (const [k, v] of Object.entries(properties)) {
                    for (const [kk] of Object.entries(v.values)) {
                        if (appointment[kk] === true)
                            convertedAppointment.properties[k] = kk;
                    }
                }
                // we sign each appointment individually so that the client can
                // verify that they've been posted by a valid provider
                const signedAppointment = await sign(
                    keyPairs.signing.privateKey,
                    JSON.stringify(convertedAppointment),
                    keyPairs.signing.publicKey
                );

                signedAppointments.push(signedAppointment);
            } catch (e) {
                console.error(e);
                continue;
            }
        }

        const result = await backend.appointments.publishAppointments(
            {
                offers: signedAppointments,
            },
            keyPairs.signing
        );

        return {
            status: 'succeeded',
            data: result,
        };
    } catch (e) {
        return {
            status: 'failed',
        };
    } finally {
        backend.local.unlock('publishAppointments');
    }
}

publishAppointments.actionName = 'publishAppointments';
