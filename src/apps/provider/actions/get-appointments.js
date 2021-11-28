// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes, sign, verify, ecdhDecrypt } from 'helpers/crypto';
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

    const decryptBookings = async bookings => {
        for (const booking of bookings) {
            const dd = JSON.parse(
                await ecdhDecrypt(
                    booking.encryptedData,
                    keyPairs.encryption.privateKey
                )
            );
            booking.data = dd;
        }
        return bookings;
    };

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
                continue;
            }
            const appData = JSON.parse(appointment.data);

            // this appointment was loaded already (should not happen)
            if (newAppointments.find(app => app.id === appData.id)) {
                continue;
            }

            const existingAppointment = openAppointments.find(
                app => app.id === appData.id
            );

            if (existingAppointment) {
                // if the remote version is older than the local one we skip this
                if (existingAppointment.modified) continue;

                // we update the appointment by removing slots that do not exist
                // in the new version and by adding slots from the new version
                // that do not exist locally

                // remove slots that do not exist in the backend
                existingAppointment.slotData = existingAppointment.slotData.filter(
                    sl => appData.slotData.some(slot => slot.id === sl.id)
                );

                // add new slots from the backend
                existingAppointment.slotData = [
                    ...existingAppointment.slotData,
                    ...appData.slotData.filter(
                        sl =>
                            !existingAppointment.slotData.some(
                                slot => slot.id === sl.id
                            )
                    ),
                ];

                // we update the slot data length
                existingAppointment.slots = appData.slotData.length;
                existingAppointment.updatedAt = appData.updatedAt;
                existingAppointment.bookings = await decryptBookings(
                    appointment.bookings || []
                );
                continue;
            }

            const newAppointment = {
                updatedAt: appData.updatedAt,
                timestamp: appData.timestamp,
                duration: appData.duration,
                slotData: appData.slotData,
                bookings: await decryptBookings(appointment.bookings || []),
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
