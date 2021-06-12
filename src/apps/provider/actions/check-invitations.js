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
        await backend.local.lock();
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

        const currentIndex = backend.local.get(
            'provider::appointments::check::index',
            0
        );
        let newIndex = currentIndex + N;
        if (newIndex >= openAppointments.length) newIndex = 0; // we start from the beginning
        backend.local.set('provider::appointments::check::index', newIndex);

        try {
            const ids = [];
            let appointments = [];
            for (const appointment of openAppointments
                .slice(currentIndex, currentIndex + N)
                .filter(oa => oa.slots > 0)) {
                const timestamp = new Date(appointment.timestamp);
                if (timestamp < new Date()) continue;
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

            for (const [i, result] of results.entries()) {
                const appointment = appointments[i];
                if (result === null) continue;
                // we try to decrypt this data with the private key of each token
                for (const openToken of openTokens) {
                    try {
                        let tokenPublicKey;

                        switch (openToken.data.version) {
                            case '0.1':
                                tokenPublicKey =
                                    openToken.encryptedData.publicKey;
                                break;
                            case '0.2':
                                tokenPublicKey =
                                    openToken.data.encryptionPublicKey;
                                break;
                        }

                        if (result.publicKey !== tokenPublicKey) continue;

                        const decryptedData = JSON.parse(
                            await ecdhDecrypt(
                                result,
                                openToken.keyPair.privateKey
                            )
                        );
                        if (decryptedData === null) continue; // not the right token....

                        const slotData = appointment.slotData.find(
                            sl =>
                                sl.token !== undefined &&
                                sl.token.token === openToken.token
                        );

                        if (slotData !== undefined) {
                            slotData.userData = decryptedData;
                            if (decryptedData.cancel === true) {
                                // the user wants to cancel this appointment
                                await cancelSlots(
                                    undefined,
                                    [slotData],
                                    openTokens
                                );
                                // we remove the canceled slot
                                appointment.slotData = appointment.slotData.filter(
                                    sl => sl.id !== slotData.id
                                );
                                // we replace the slot
                                appointment.slotData.push(createSlot());
                                // We reset the expiration time. The sendInvitations
                                // action will take care of giving the token a new one
                                openToken.expiresAt = undefined;
                            } else {
                                // the token will expire with the appointment
                                openToken.expiresAt = new Date(
                                    appointment.timestamp
                                ).toISOString();
                            }
                        } else {
                            // we get the slot data for the token
                            const slotData = appointment.slotData.find(
                                sl => sl.id === ids[i]
                            );
                            slotData.open = false;
                            slotData.token = openToken;
                            slotData.userData = decryptedData;
                            // the token will expire with the appointment
                            openToken.expiresAt = new Date(
                                appointment.timestamp
                            ).toISOString();
                        }
                    } catch (e) {
                        console.error(e);
                        continue;
                    }
                }
            }

            // remove appointments that are in the past
            const pastAppointments = openAppointments.filter(
                oa => new Date(oa.timestamp) < new Date()
            );

            // only keep appointments that are in the future
            openAppointments = openAppointments.filter(
                oa => new Date(oa.timestamp) >= new Date()
            );
            backend.local.set('provider::appointments::open', openAppointments);

            // we mark the successful tokens
            const newlyUsedTokens = pastAppointments
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

            backend.local.set('provider::tokens::open', openTokens);

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
        backend.local.unlock();
    }
}

checkInvitations.actionName = 'checkInvitations';
