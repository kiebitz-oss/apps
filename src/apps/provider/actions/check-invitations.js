// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from 'helpers/crypto';
import { cancelSlots } from './cancel-appointment';
import { createSlot } from './create-appointment';
import { MN } from './send-invitations';

// we give a grace period before expiring tokens (so that we're able to
// catch bookings made just before the expiration date)
const GRACE_SECONDS = 60 * 15;

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
        let bookings = backend.local.get('provider::bookings', 0);

        let openSlots = 0;
        openAppointments
            .filter(oa => new Date(oa.timestamp) > new Date())
            .forEach(ap => {
                openSlots += ap.slotData.filter(sl => sl.open).length;
            });

        // we keep a list of canceled slots so that we can restore them. Just in case...
        let canceledSlots = backend.local.get(
            'provider::appointments::slots::canceled',
            []
        );

        const currentIndex = backend.local.get(
            'provider::appointments::check::index',
            0
        );

        const relevantAppointments = openAppointments
            .filter(oa => new Date(oa.timestamp) > new Date())
            .filter(oa => oa.slots > 0);

        let newIndex = currentIndex + N;
        if (newIndex >= relevantAppointments.length) newIndex = 0; // we start from the beginning
        backend.local.set('provider::appointments::check::index', newIndex);

        console.log(
            `Checking ${openTokens.length} open tokens against ${openAppointments.length} open appointments, current check index is ${currentIndex}...`
        );

        try {
            const ids = [];
            let appointments = [];
            // we only check appointments that are in the future
            for (const appointment of relevantAppointments.slice(
                currentIndex,
                currentIndex + N
            )) {
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
                                invalidSlotData.cancelReason =
                                    'decryptionError';
                                await cancel(invalidSlotData);
                                openToken.expiresAt = undefined;
                                openToken.expirationCount = undefined;
                                openToken.grantID = undefined;
                            }
                            continue processAppointments; // something went wrong with the decryption...
                        }

                        if (slotData !== undefined) {
                            slotData.userData = decryptedData;
                            if (decryptedData.cancel === true) {
                                console.log('User requested cancellation...');
                                // the user requested a cancellation
                                slotData.cancelReason = 'userRequest';
                                await cancel(slotData);
                                openToken.expiresAt = undefined;
                                openToken.expirationCount = undefined;
                                openToken.grantID = undefined;
                            }
                        } else {
                            bookings++;
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
                        console.log('No token for this slot, canceling...');
                        // if this slot has an associated token we never delete it
                        if (invalidSlotData.token !== undefined) {
                            const missingToken = invalidSlotData.token;
                            missingToken.expiresAt = undefined;
                            missingToken.expirationCount = undefined;
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

            if (newIndex === 0) {
                openTokens.forEach(token => {
                    if (
                        token.expiresAt !== undefined &&
                        new Date() > new Date(token.expiresAt)
                    ) {
                        if (token.expirationCount === undefined)
                            token.expirationCount = 1;
                        else token.expirationCount++;
                    }
                });
            }

            // we give a grace period before we remove the tokens
            const now = new Date(new Date().getTime() - 1000 * GRACE_SECONDS);

            // a token is expired if the expiration count is greater than 10
            // and the expiration date is in the past (minus grace period)
            const isExpired = token =>
                !(
                    token.expiresAt === undefined ||
                    now < new Date(token.expiresAt) ||
                    token.expirationCount === undefined ||
                    token.expirationCount < 10
                );

            // if we have too many tokens we need to get rid of some first
            // before we can get more... Also if we don't have any open
            // slots anymore...
            // to do: sort tokens by expiration date and only remove as many
            // as necessary?
            if (openTokens.length > 0.7 * MN || openSlots === 0) {
                // we filter out all expired tokens...

                let expiredTokens = openTokens.filter(isExpired);
                let alreadyExpiredTokens = backend.local.get(
                    'provider::tokens::expired',
                    []
                );
                alreadyExpiredTokens = [
                    ...alreadyExpiredTokens,
                    ...expiredTokens,
                ];
                // we keep the most recent tokens in the list and age out the oldest ones...
                const index = Math.max(alreadyExpiredTokens.length - MN, 0);
                alreadyExpiredTokens = alreadyExpiredTokens.slice(
                    index,
                    index + MN
                );
                backend.local.set(
                    'provider::tokens::expired',
                    alreadyExpiredTokens
                );

                // here's the dangerous part: we delete expired tokens!
                openTokens = openTokens.filter(token => !isExpired(token));
            } else {
                // if we still have room we just prolong existing tokens...
                openTokens.forEach(token => {
                    // we prolong the life of expired tokens...
                    if (
                        token.expiresAt !== undefined &&
                        new Date() > new Date(token.expiresAt)
                    ) {
                        token.expiresAt = undefined;
                        token.expirationCount = undefined;
                    }
                });
            }

            backend.local.set('provider::appointments::open', openAppointments);
            backend.local.set('provider::tokens::open', openTokens);
            backend.local.set('provider::bookings', bookings);
            backend.local.set(
                'provider::appointments::slots::canceled',
                canceledSlots
            );

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
