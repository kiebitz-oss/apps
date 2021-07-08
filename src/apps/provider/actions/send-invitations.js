// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    sign,
    deriveSecrets,
    ecdhEncrypt,
    ecdhDecrypt,
    randomBytes,
    generateECDHKeyPair,
} from 'helpers/crypto';

import { b642buf } from 'helpers/conversion';

import { shuffle } from 'helpers/lists';

function getQueuePrivateKey(queueID, verifiedProviderData) {
    for (const queueKeys of verifiedProviderData.queuePrivateKeys) {
        if (queueKeys.id === queueID) return JSON.parse(queueKeys.privateKey);
    }
    return null;
}

// we process at most N tokens during one invocation of this function
const N = 200;
// we store at most MN tokens in the app
export const MN = 500;
// we keep offers valid for a given number of seconds
const EXP_SECONDS = 60 * 60;
// we regard tokens as 'fresh' for a given number of seconds
const FRESH_SECONDS = 60 * 30;
// how many more users we invite than we have slots
const OVERBOOKING_FACTOR = 50;

// regularly checks open appointment slots
export async function sendInvitations(
    state,
    keyStore,
    settings,
    keyPairs,
    verifiedProviderData
) {
    const backend = settings.get('backend');
    // we lock the local backend to make sure we don't have any data races

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('sendInvitations');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        // we do not save the appointments!
        let openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );

        let bookings = backend.local.get('provider::bookings', 0);
        let reportedBookings = backend.local.get(
            'provider::bookings::reported',
            0
        );
        backend.local.set('provider::bookings::reported', bookings);

        if (openAppointments.length === 0)
            // we don't have any new appointments to give out
            return {
                status: 'succeeded',
            };

        // only offer appointments that are in the future
        openAppointments = openAppointments.filter(
            oa => new Date(oa.timestamp) > new Date()
        );

        let openTokens = backend.local.get('provider::tokens::open', []);

        openTokens.forEach(token => {
            if (token.expiresAt === undefined) {
                token.expiresAt = new Date(
                    new Date().getTime() + 1000 * EXP_SECONDS
                );
            }
        });

        let freshTokens = openTokens.filter(
            token =>
                new Date(token.createdAt) >
                new Date(new Date().getTime() - 1000 * FRESH_SECONDS)
        );

        let openSlots = 0;
        let bookedSlots = 0;
        openAppointments.forEach(ap => {
            openSlots += ap.slotData.filter(sl => sl.open).length;
            bookedSlots += ap.slotData.filter(sl => !sl.open).length;
        });

        try {
            console.log(
                `Got ${openSlots} open slots and ${freshTokens.length} fresh tokens (${openTokens.length} tokens in total), overbooking factor is ${OVERBOOKING_FACTOR}...`
            );
            const n = Math.floor(
                Math.min(
                    Math.max(0, MN - openTokens.length),
                    Math.max(
                        0,
                        openSlots * OVERBOOKING_FACTOR - freshTokens.length
                    )
                )
            );

            const selectedAppointments = openAppointments.filter(
                oa =>
                    new Date(oa.timestamp) > new Date() &&
                    oa.slotData.length > 0
            );
            const appointmentsById = {};
            const appointmentsBySlotId = {};
            const slotsById = {};

            for (const oa of selectedAppointments) {
                appointmentsById[oa.id] = oa;
                for (const slot of oa.slotData) {
                    appointmentsBySlotId[slot.id] = oa;
                    slotsById[slot.id] = slot;
                }
            }

            const currentIndex = backend.local.get(
                'provider::appointments::send::index',
                0
            );
            let newIndex = currentIndex + N;
            if (newIndex >= openTokens.length) newIndex = 0; // we start from the beginning
            backend.local.set('provider::appointments::send::index', newIndex);

            let tokensToSubmit = [];
            let dataToSubmit = [];

            const doSubmitData = async () => {
                try {
                    // we send the signed, encrypted data to the backend
                    const results = await backend.appointments.bulkStoreData(
                        { dataList: dataToSubmit },
                        keyPairs.signing
                    );
                    for (const [i, result] of results.entries()) {
                        if (result !== null) {
                            const resultToken = tokensToSubmit[i];
                            if (resultToken.dataN >= 19) return; // we try 20 different IDs at most
                            resultToken.dataN++;
                            // we rotate the ID for this token...
                            resultToken.dataID = (
                                await deriveSecrets(
                                    b642buf(resultToken.data.id),
                                    32,
                                    resultToken.dataN
                                )
                            )[resultToken.dataN - 1];
                        }
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    dataToSubmit = [];
                    tokensToSubmit = [];
                }
            };

            // we make sure all token holders can initialize all appointment data IDs
            for (const [i, token] of openTokens
                .slice(currentIndex, currentIndex + N)
                .entries()) {
                try {
                    if (token.grantID === undefined)
                        token.grantID = randomBytes(32);

                    if (token.dataID === undefined) {
                        token.dataID = token.data.id;
                        token.dataN = 0;
                    }

                    if (token.slotIDs === undefined) {
                        token.slotIDs = [];
                    }

                    token.slotIDs = token.slotIDs.filter(id => {
                        const slot = slotsById[id];
                        if (slot === undefined) return false;
                        if (
                            slot.token !== undefined &&
                            slot.token.token === token.token
                        )
                            return true;
                        return false;
                    });

                    if (token.createdAt === undefined)
                        token.createdAt = new Date().toISOString();

                    const slots = [];
                    token.slotIDs.forEach(id => {
                        const slot = slotsById[id];
                        if (slot !== undefined) slots.push(slot);
                    });

                    let grantsData = await Promise.all(
                        slots.map(async slot => {
                            const oa = appointmentsBySlotId[slot.id];
                            // cancellation & booking max 15 minutes before appointment
                            let expiresAt = new Date(
                                new Date(oa.timestamp).getTime() -
                                    1000 * 60 * 15
                            );
                            if (expiresAt > new Date(token.expiresAt))
                                expiresAt = new Date(token.expiresAt);
                            return await sign(
                                keyPairs.signing.privateKey,
                                JSON.stringify({
                                    objectID: slot.id,
                                    grantID: token.grantID,
                                    singleUse: true,
                                    expiresAt: expiresAt.toISOString(),
                                    // data will expire one hour after the appointment
                                    dataExpiresAt: new Date(
                                        new Date(oa.timestamp).getTime() +
                                            1000 * 60 * 60
                                    ).toISOString(),
                                    permissions: [
                                        {
                                            rights: ['read', 'write', 'delete'],
                                            keys: [keyPairs.signing.publicKey],
                                        },
                                        {
                                            rights: ['write', 'read', 'delete'],
                                            keys: [token.data.publicKey],
                                        },
                                    ],
                                }),
                                keyPairs.signing.publicKey
                            );
                        })
                    );

                    const appointments = {};

                    slots.forEach((slot, i) => {
                        const oa = appointmentsBySlotId[slot.id];
                        if (appointments[oa.id] === undefined)
                            appointments[oa.id] = {
                                ...oa,
                                slotData: [],
                                grants: [],
                            };

                        const appointment = appointments[oa.id];

                        const slotCopy = { ...slot };

                        // we remove the token information (only delivered to the user
                        // but it's not used currently and there's no reason for the user to see it...)
                        delete slotCopy.token;
                        delete slotCopy.userData;

                        appointment.slotData.push(slotCopy);
                        appointment.grants.push(grantsData[i]);
                    });

                    const userData = {
                        provider: verifiedProviderData.signedData,
                        createdAt: new Date().toISOString(),
                        offers: Array.from(Object.values(appointments)),
                    };

                    let tokenPublicKey;

                    switch (token.data.version) {
                        case '0.1':
                            tokenPublicKey = token.encryptedData.publicKey;
                            break;
                        case '0.2':
                        case '0.3':
                            tokenPublicKey = token.data.encryptionPublicKey;
                            break;
                    }

                    // we first encrypt the data
                    const encryptedUserData = await ecdhEncrypt(
                        JSON.stringify(userData),
                        token.keyPair,
                        tokenPublicKey
                    );
                    // we sign the data with our private key
                    const signedEncryptedUserData = await sign(
                        keyPairs.signing.privateKey,
                        JSON.stringify(encryptedUserData),
                        keyPairs.signing.publicKey
                    );

                    const submitData = {
                        id: token.dataID,
                        data: signedEncryptedUserData,
                        // data will expire with the token
                        expiresAt: new Date(
                            new Date(token.expiresAt).getTime() + 1000 * 60 * 60
                        ).toISOString(),
                        permissions: [
                            {
                                rights: ['read'],
                                keys: [token.data.publicKey],
                            },
                            {
                                rights: ['read', 'write', 'delete'],
                                keys: [keyPairs.signing.publicKey],
                            },
                        ],
                    };
                    dataToSubmit.push(submitData);
                    tokensToSubmit.push(token);
                } catch (e) {
                    console.error(e);
                    continue;
                }

                if (dataToSubmit.length >= 100) {
                    await doSubmitData();
                }
            }

            if (dataToSubmit.length > 0) {
                await doSubmitData();
            }

            backend.local.set('provider::tokens::open', openTokens);

            return { status: 'succeeded' };
        } catch (e) {
            console.error(e);
            return { status: 'failed', error: e };
        }
    } catch (e) {
        console.error(e);
    } finally {
        backend.local.unlock('sendInvitations');
    }
}

sendInvitations.actionName = 'sendInvitations';
