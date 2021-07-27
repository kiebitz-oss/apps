// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes, sign, verify } from 'helpers/crypto';
import { formatDate, formatTime } from 'helpers/time';

export async function getAppointments(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');
    const properties = settings.get('appointmentProperties');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('getAppointments');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );

        const result = await backend.appointments.getAppointments(
            {},
            keyPairs.signing
        );

        const newAppointments = [];

        for (const appointment of result) {
            const verified = await verify(
                [keyPairs.signing.publicKey],
                appointment
            );
            if (!verified) {
                console.error('invalid signature');
                continue;
            }
            const appData = JSON.parse(appointment.data);

            if (
                openAppointments.find(app => app.id === appData.id) ||
                newAppointments.find(app => app.id === appData.id)
            ) {
                console.log('already exists');
                continue;
            }

            const newAppointment = {
                timestamp: appData.timestamp,
                duration: appData.duration,
                slotData: appData.slotData,
                id: appData.id,
                slots: appData.slotData.length,
            };

            for (const [k, v] of Object.entries(appData.properties)) {
                newAppointment[v] = true;
            }

            newAppointments.push(newAppointment);
        }

        backend.local.set('provider::appointments::open', [
            ...openAppointments,
            ...newAppointments,
        ]);

        return {
            status: 'succeeded',
            data: result,
        };
    } catch (e) {
        console.error(e);
        return {
            status: 'failed',
        };
    } finally {
        backend.local.unlock('getAppointments');
    }
}

getAppointments.actionName = 'getAppointments';
