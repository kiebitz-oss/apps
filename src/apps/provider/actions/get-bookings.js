// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify, ecdhDecrypt } from 'helpers/crypto';

export async function getBookings(state, keyStore, settings, keyPairs, keys) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('getBookings');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        keyStore.set({ status: 'submitting' });
        const appointments = backend.local.get(
            'provider::appointments::open',
            []
        );

        try {
            const result = await backend.appointments.getBookedAppointments(
                {},
                keyPairs.signing
            );

            const bookingsById = {};
            for (const item of result) {
                try {
                    const appointment = appointments.find(app =>
                        app.slotData.some(sl => sl.id === item.id)
                    );
                    const dd = JSON.parse(
                        await ecdhDecrypt(
                            item.encryptedData,
                            keyPairs.encryption.privateKey
                        )
                    );

                    if (dd === null || appointment === undefined) {
                        continue;
                        await backend.appointments.cancelBooking(
                            { id: item.id },
                            keyPairs.signing
                        );
                    }

                    bookingsById[item.id] = dd;
                } catch (e) {
                    continue;
                }
            }

            for (const appointment of appointments) {
                for (const slotData of appointment.slotData) {
                    const booking = bookingsById[slotData.id];
                    if (booking === undefined) {
                        slotData.open = true;
                        delete slotData.token;
                    } else {
                        slotData.open = false;
                        slotData.token = {
                            token: booking.signedToken,
                            data: booking.tokenData,
                            contactData: booking.contactData,
                        };
                    }
                }
            }

            backend.local.set('provider::bookings::list', result);

            backend.local.set('provider::appointments::open', appointments);

            return {
                data: result,
                status: 'suceeded',
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e,
            };
        }
    } finally {
        backend.local.unlock('getBookings');
    }
}

getBookings.reset = () => ({ status: 'initialized' });

getBookings.actionName = 'getBookings';
