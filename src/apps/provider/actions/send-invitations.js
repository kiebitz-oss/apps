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

    // we process at most N tokens during one invocation of this function
    const N = 500;
    // we store at most MN tokens in the app
    const MN = 800;
    // we keep offers valid for a given number of seconds
    const EXP_SECONDS = 60*60*4;
    // we regard tokens as 'fresh' for a given number of seconds
    const FRESH_SECONDS = 60*15;
    // we give a grace period before expiring tokens (so that we're able to
    // catch bookings made just before the expiration date)
    const GRACE_SECONDS = 60*15;

    try {

        let openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );

        if (openAppointments.length === 0)
            // we don't have any new appointments to give out
            return {
                status: 'succeeded',
            };

        // only offer appointments that are in the future
        openAppointments = openAppointments.filter(oa => {
            const timestamp = new Date(oa.timestamp);
            const inOneHour = new Date(new Date().getTime() + 1000 * 60 * 60);
            return timestamp > new Date();
        });

        let openTokens = backend.local.get('provider::tokens::open', []);

        openTokens.forEach(token => {
            if (token.expiresAt === undefined){
                if (token.createdAt !== undefined)
                    token.expiresAt = new Date(
                        new Date(token.createdAt).getTime() +
                            1000 * EXP_SECONDS
                    );
                else
                    token.expiresAt = new Date(
                        new Date().getTime() +
                            1000 * EXP_SECONDS
                    );
            }
        })

        // we give a grace period before we remove the token
        const now = new Date(new Date().getTime()-1000*GRACE_SECONDS)
        openTokens = openTokens.filter(token => now < new Date(token.expiresAt))

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
            // how many more users we invite than we have slots
            const overbookingFactor = 10;
            console.log(
                `Got ${openSlots} open slots and ${freshTokens.length} fresh tokens (${openTokens.length} tokens in total), overbooking factor is ${overbookingFactor}...`
            );
            const n = Math.floor(
                Math.min(Math.max(0, MN-openTokens.length), Math.max(0, openSlots * overbookingFactor - freshTokens.length))
            );
            // we don't have enough tokens for our open appointments, we generate more
            if (n > 0 || true) {
                console.log(`Trying to get ${n} new tokens...`);
                // to do: get appointments by type
                const newTokens = await backend.appointments.getQueueTokens(
                    { expiration: EXP_SECONDS, capacities: [{ n: n, tokens: openTokens.length, open: openSlots, booked: bookedSlots, properties: {} }] },
                    keyPairs.signing
                );
                if (newTokens === null)
                    return {
                        status: 'failed',
                    };
                const validTokens = [];
                for (const tokenList of newTokens) {
                    console.log(`New tokens received: ${tokenList.length}`);
                    for (const token of tokenList) {
                        const privateKey = getQueuePrivateKey(
                            token.queue,
                            verifiedProviderData
                        );
                        try {
                            token.data = JSON.parse(
                                await ecdhDecrypt(
                                    token.encryptedData,
                                    privateKey
                                )
                            );
                            if (token.data === null) continue;
                        } catch (e) {
                            console.error(e);
                            continue;
                        }
                        if (openTokens.some(openToken => openToken.token === token.token)){
                            continue // we already have this token
                        }
                        token.keyPair = await generateECDHKeyPair();
                        // the initial offer is always done using the token, to prevent the
                        // user from booking an unlimited number of appointments...
                        token.grantID = randomBytes(32);
                        token.slotIDs = [];
                        token.createdAt = new Date().toISOString();
                        token.expiresAt = new Date(
                            new Date().getTime() +
                                1000 * EXP_SECONDS
                        );
                        validTokens.push(token);
                    }
                    openTokens = [...openTokens, ...validTokens];
                }
                // we update the list of open tokens
                backend.local.set('provider::tokens::open', openTokens);
            }

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
                    for(const [i, result] of results.entries()){
                        if (result !== null){
                            const resultToken = tokensToSubmit[i]
                            if (resultToken.dataN > 10)
                                return // we try 10 different IDs at most 
                            resultToken.dataN++
                            // we rotate the ID for this token...
                            resultToken.dataID = (await deriveSecrets(b642buf(resultToken.data.id), 32, resultToken.dataN))[resultToken.dataN-1]
                        }

                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    dataToSubmit = [];
                    tokensToSubmit = [];
                }
            }

            // we make sure all token holders can initialize all appointment data IDs
            for (const [i, token] of openTokens
                .slice(currentIndex, currentIndex + N)
                .entries()) {
                try {

                    if (token.grantID === undefined)
                        token.grantID = randomBytes(32);

                    if (token.dataID === undefined){
                        token.dataID = token.data.id
                        token.dataN = 0;
                    }

                    if (token.slotIDs === undefined) {
                        token.slotIDs = [];
                        // we always add the booked slot (we can remove this for the next version, just for backwards-compatibility)
                        for (const slot of Object.values(slotsById)) {
                            if (
                                slot.token !== undefined &&
                                slot.token.token === token.token
                            ) {
                                token.slotIDs.push(slot.id);
                            }
                        }
                    }

                    token.slotIDs = token.slotIDs.filter(id => {
                        const slot = slotsById[id];
                        // we remove slots that have been deleted e.g. because
                        // the appointment has been deleted
                        if (slot === undefined) return false;
                        // we remove slots taken by other users as the user
                        // won't be able to book them anymore...
                        if (!slot.open && slot.token.token !== token.token)
                            return false;
                        return true;
                    });

                    addSlots: while (token.slotIDs.length < 20) {
                        let addedSlots = 0;
                        // we shuffle the open appointments to distribute them
                        // evenly over all tokens
                        shuffle(selectedAppointments);
                        for (const oa of selectedAppointments) {
                            const openSlots = oa.slotData.filter(sl => sl.open);
                            // we shuffle the open slots to distribute them
                            // evenly over all tokens
                            shuffle(openSlots);
                            const existingSlots = token.slotIDs.filter(
                                id =>
                                    oa.slotData.find(
                                        osl => osl.id === id
                                    ) !== undefined
                            ).length;
                            if (existingSlots >= 3) continue; // the user already has 3 slots for this appointment, that's all we give out...
                            // we add three slots per appointment offer
                            for (
                                let i = 0;
                                i < Math.min(3, openSlots.length);
                                i++
                            ) {
                                // we check if the slot is already associated
                                // with this token
                                if (
                                    token.slotIDs.find(
                                        id => id === openSlots[i].id
                                    ) === undefined
                                ) {
                                    addedSlots++;
                                    token.slotIDs.push(openSlots[i].id);
                                }
                                if (token.slotIDs.length >= 12) break addSlots;
                            }
                        }
                        // seems there are no more slots left, we break out
                        // of the loop
                        if (addedSlots === 0) break;
                    }

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
                                expiresAt = new Date(token.expiresAt)
                            return await sign(
                                keyPairs.signing.privateKey,
                                JSON.stringify({
                                    objectID: slot.id,
                                    grantID: token.grantID,
                                    singleUse: true,
                                    expiresAt: expiresAt.toISOString(),
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

                        appointment.slotData.push(slot);
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
                    tokensToSubmit.push(token)
                } catch (e) {
                    console.error(e);
                    continue;
                }

                if (dataToSubmit.length > 100) {
                    await doSubmitData()
                }
            }

            if (dataToSubmit.length > 0) {
                await doSubmitData()
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
