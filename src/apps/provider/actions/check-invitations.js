// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from 'helpers/crypto';

// checks invitations
export async function checkInvitations(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

        let openTokens = backend.local.get('provider::tokens::open', []);
        let openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );
        try {
            const ids = [];
            const cancelIds = [];
            const appointments = [];
            const usedTokens = [];
            for (const appointment of openAppointments) {
                for (const slotData of appointment.slotData) {
                    if (!slotData.open) continue;
                    ids.push(slotData.id);
                    cancelIds.push(slotData.cancel);
                    appointments.push(appointment);
                }
            }
            const allIds = [...ids];
            const results = await backend.appointments.bulkGetData(
                { ids: allIds },
                keyPairs.signing
            );
            for (const [i, result] of results.entries()) {
                const appointment = appointments[i];
                if (result === null) continue;
                // we try to decrypt this data with the private key of each token
                for (const openToken of openTokens) {
                    try {
                        const decryptedData = JSON.parse(
                            await ecdhDecrypt(
                                result,
                                openToken.keyPair.privateKey
                            )
                        );
                        if (decryptedData === null) continue; // not the right token....

                        const signedData = JSON.parse(
                            decryptedData.signedToken.data
                        );

                        if (
                            openAppointments.find(oa =>
                                oa.slotData.some(
                                    sl =>
                                        sl.token !== undefined &&
                                        sl.token.token === signedData.token
                                )
                            )
                        ) {
                            continue; // we already stored this token
                        }

                        // we get the slot data for the token
                        const slotData = appointment.slotData.find(
                            sl => sl.id === allIds[i]
                        );
                        slotData.open = false;
                        slotData.token = openToken;
                        slotData.userData = decryptedData;

                        usedTokens.push(openToken);
                    } catch (e) {
                        console.error(e);
                        continue;
                    }
                }
            }
            backend.local.set('provider::appointments::open', openAppointments);

            // we remove the tokens corresponding to the accepted slots from
            // the list of open tokens...
            openTokens = openTokens.filter(
                ot => !usedTokens.some(ut => ut.token === ot.token)
            );

            backend.local.set('provider::tokens::open', openTokens);

            return {
                status: 'loaded',
                data: openAppointments,
            };
        } catch (e) {
            console.log(e);
        }
    } finally {
        backend.local.unlock();
    }
}

checkInvitations.actionName = 'checkInvitations';
