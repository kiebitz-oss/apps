// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from 'helpers/crypto';
import { cancelSlots } from './cancel-appointment';
import { createSlot } from './create-appointment';

// checks invitations
export async function checkInvitations(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('checkInvitations');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    // we process at most N appointments during one invocation of this function
    const N = 50;

    try {
        let openTokens = backend.local.get('provider::tokens::open', []);
        let openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );

        // we keep a list of canceled slots so that we can restore them. Just in case...
        let canceledSlots = backend.local.get(
            'provider::appointments::slots::canceled',
            []
        );

        const currentIndex = backend.local.get(
            'provider::appointments::check::index',
            0
        );
        let newIndex = currentIndex + N;
        if (newIndex >= openAppointments.length) newIndex = 0; // we start from the beginning
        backend.local.set('provider::appointments::check::index', newIndex);

        console.log(
            `Checking ${openTokens.length} open tokens against ${openAppointments.length} open appointments, current check index is ${currentIndex}...`
        );

        try {
            const ids = [];
            let appointments = [];
            for (const appointment of openAppointments
                .slice(currentIndex, currentIndex + N)
                .filter(oa => oa.slots > 0)) {
                for (const slotData of appointment.slotData) {
                    ids.push(slotData.id);
                    appointments.push(appointment);
                }
            }

            const results = [];

            // we make requests with 100 IDs at a time
            for (let i = 0; i < ids.length; i += 100) {
                const sliceResults = await backend.appointments.bulkGetData(
                    { ids: ids.slice(i, i + 100) },
                    keyPairs.signing
                );
                sliceResults.forEach(result => results.push(result));
            }

            if (results.length !== ids.length) {
                throw 'lengths do not match';
            }

            processAppointments: for (const [i, result] of results.entries()) {
                const appointment = appointments[i];
                if (result === null) continue;

                const cancel = async slotData => {
                    console.log('Canceling slot');
                    canceledSlots.push(slotData);
                    // the user wants to cancel this appointment
                    await cancelSlots(undefined, [slotData], openTokens);
                    // we remove the canceled slot
                    appointment.slotData = appointment.slotData.filter(
                        sl => sl.id !== slotData.id
                    );
                    // we replace the slot
                    appointment.slotData.push(createSlot());
                };

                // we try to decrypt this data with the private key of each token
                for (const openToken of openTokens) {
                    try {
                        let tokenPublicKey;

                        switch (openToken.data.version) {
                            case undefined:
                            case '0.1':
                                tokenPublicKey =
                                    openToken.encryptedData.publicKey;
                                break;
                            case '0.2':
                            case '0.3':
                                tokenPublicKey =
                                    openToken.data.encryptionPublicKey;
                                break;
                        }

                        if (result.publicKey !== tokenPublicKey) continue;

                        const slotData = appointment.slotData.find(
                            sl =>
                                sl.token !== undefined &&
                                sl.token.token === openToken.token
                        );

                        const decryptedData = JSON.parse(
                            await ecdhDecrypt(
                                result,
                                openToken.keyPair.privateKey
                            )
                        );

                        if (decryptedData === null) {
                            console.log(
                                'Cannot decrypt data, discarding slot...'
                            );

                            const invalidSlotData = appointment.slotData.find(
                                sl => sl.id === ids[i]
                            );

                            // if the slot data is defined, we cancel the slot (as someone
                            // might have put invalid data there so we can't read it anymore...)
                            if (invalidSlotData !== undefined) {
                                invalidSlotData.cancelReason = 'decryptionError';
                                await cancel(invalidSlotData);
                                openToken.expiresAt = undefined;
                                openToken.grantID = undefined;
                            }
                            continue processAppointments; // something went wrong with the decryption...
                        }

                        if (slotData !== undefined) {
                            slotData.userData = decryptedData;
                            if (decryptedData.cancel === true) {
                                console.log("User requested cancellation...")
                                // the user requested a cancellation
                                slotData.cancelReason = 'userRequest';
                                await cancel(slotData);
                                openToken.expiresAt = undefined;
                                openToken.grantID = undefined;
                            }
                        } else {
                            // we get the slot data for the token
                            const slotData = appointment.slotData.find(
                                sl => sl.id === ids[i]
                            );
                            slotData.open = false;
                            slotData.token = openToken;
                            openToken.expiresAt = new Date(
                                appointment.timestamp
                            );
                            if (decryptedData !== null)
                                slotData.userData = decryptedData;
                        }
                        console.log('processed appointment');
                        // we continue with the next appointment
                        continue processAppointments;
                    } catch (e) {
                        console.error(e);
                        continue processAppointments;
                    }
                }

                // no open token matches this slot data, we discard it
                try {
                    const invalidSlotData = appointment.slotData.find(
                        sl => sl.id === ids[i]
                    );

                    if (invalidSlotData !== undefined) {
                        console.log("No token for this slot, canceling...")
                        // if this slot has an associated token so we never delete it
                        if (invalidSlotData.token !== undefined) {
                            const missingToken = invalidSlotData.token;
                            missingToken.expiresAt = undefined;
                            missingToken.grantID = undefined;
                            openTokens.push(missingToken);
                            continue;
                        }
                        // there's not token associated with this slot, so we
                        // delete it...
                        invalidSlotData.cancelReason = 'noMatchingToken';
                        await cancel(invalidSlotData);
                    }
                } catch (e) {
                    console.log(e);
                    continue;
                }
            }

            /*

            const isExpired = oa =>
                new Date(oa.timestamp) <
                new Date(new Date().getTime() - 1000 * 60 * 60 * 2);

            // remove appointments that are in the past (with a 2 hour grace period)
            const newlyPastAppointments = openAppointments.filter(oa =>
                isExpired(oa)
            );

            // only keep appointments that are in the future
            openAppointments = openAppointments.filter(oa => !isExpired(oa));

            if (newlyPastAppointments.length > 0) {
                const pastAppointments = backend.local.get(
                    'provider::appointments::past',
                    []
                );
                backend.local.set('provider::appointments::past', [
                    ...pastAppointments,
                    ...newlyPastAppointments,
                ]);
            }

            // we mark the successful tokens
            const newlyUsedTokens = newlyPastAppointments
                .map(pa =>
                    pa.slotData
                        .filter(sl => sl.token !== undefined)
                        .map(sl => sl.token)
                )
                .flat();

            // we send the signed, encrypted data to the backend
            if (newlyUsedTokens.length > 0) {
                const usedTokens = backend.local.get(
                    'provider::tokens::used',
                    []
                );
                backend.local.set('provider::tokens::used', [
                    ...usedTokens,
                    ...newlyUsedTokens,
                ]);
                try {
                    await backend.appointments.markTokensAsUsed(
                        { tokens: newlyUsedTokens.map(token => token.token) },
                        keyPairs.signing
                    );
                } catch (e) {
                    console.error(e);
                }
            }

            // we remove the past tokens from the list of open tokens...
            openTokens = openTokens.filter(
                ot => !newlyUsedTokens.some(pt => pt.token === ot.token)
            );

            */

            backend.local.set('provider::appointments::open', openAppointments);
            backend.local.set('provider::tokens::open', openTokens);
            backend.local.set('provider::appointments::slots::canceled', canceledSlots);

            return {
                status: 'loaded',
                data: openAppointments,
            };
        } catch (e) {
            console.error(e);
            return {
                status: 'failed',
                error: e,
            };
        }
    } finally {
        backend.local.unlock('checkInvitations');
    }
}

checkInvitations.actionName = 'checkInvitations';
