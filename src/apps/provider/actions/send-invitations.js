// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    sign,
    ecdhEncrypt,
    ecdhDecrypt,
    randomBytes,
    generateECDHKeyPair,
} from 'helpers/crypto';

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
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

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
            return timestamp > inOneHour;
        });

        let openTokens = backend.local.get('provider::tokens::open', []);
        let openSlots = 0;
        openAppointments.forEach(ap => {
            openSlots += ap.slotData.filter(sl => sl.open).length;
        });
        try {
            const n = Math.max(0, openSlots - openTokens.length);
            // we don't have enough tokens for our open appointments, we generate more
            if (n > 0) {
                // to do: get appointments by type
                const newTokens = await backend.appointments.getQueueTokens(
                    { capacities: [{ n: n, properties: {} }] },
                    keyPairs.signing
                );
                if (newTokens === null)
                    return {
                        status: 'failed',
                    };
                const validTokens = [];
                for (const tokenList of newTokens) {
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
                        } catch (e) {
                            console.error(e);
                            continue;
                        }
                        token.keyPair = await generateECDHKeyPair();
                        token.grantID = randomBytes(32);
                        token.cancelGrantID = randomBytes(32);
                        validTokens.push(token);
                    }
                    openTokens = [...openTokens, ...validTokens];
                }
                // we update the list of open tokens
                backend.local.set('provider::tokens::open', openTokens);
            }
            const dataToSubmit = [];
            // we make sure all token holders can initialize all appointment data IDs
            for (const [i, token] of openTokens.entries()) {
                try {
                    if (token.grantID === undefined)
                        token.grantID = randomBytes(32);
                    if (token.cancelGrantID === undefined)
                        token.cancelGrantID = randomBytes(32);
                    // we generate grants for all appointments IDs.
                    let grantsData = await Promise.all(
                        openAppointments
                            .filter(
                                oa =>
                                    oa.slotData.filter(sl => sl.open).length > 0
                            )
                            .map(
                                async oa =>
                                    await Promise.all(
                                        oa.slotData
                                            .filter(sl => sl.open)
                                            .map(
                                                async sl =>
                                                    await Promise.all(
                                                        [
                                                            [
                                                                sl.id,
                                                                token.grantID,
                                                            ],
                                                            [
                                                                sl.cancel,
                                                                token.cancelGrantID,
                                                            ],
                                                        ].map(
                                                            async ([
                                                                id,
                                                                grantID,
                                                            ]) =>
                                                                await sign(
                                                                    keyPairs
                                                                        .signing
                                                                        .privateKey,
                                                                    JSON.stringify(
                                                                        {
                                                                            objectID: id,
                                                                            grantID: grantID,
                                                                            singleUse: true,
                                                                            expiresAt: new Date(
                                                                                new Date().getTime() +
                                                                                    1000 *
                                                                                        60 *
                                                                                        60 *
                                                                                        24 *
                                                                                        7
                                                                            ),
                                                                            permissions: [
                                                                                {
                                                                                    rights: [
                                                                                        'write',
                                                                                        'read',
                                                                                        'delete',
                                                                                    ],
                                                                                    keys: [
                                                                                        token
                                                                                            .data
                                                                                            .publicKey,
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        }
                                                                    ),
                                                                    keyPairs
                                                                        .signing
                                                                        .publicKey
                                                                )
                                                        )
                                                    )
                                            )
                                    )
                            )
                    );
                    grantsData = grantsData.map(gd => gd.flat());
                    const userData = {
                        provider: verifiedProviderData.signedData,
                        offers: openAppointments
                            .filter(
                                oa =>
                                    oa.slotData.filter(sl => sl.open).length > 0
                            )
                            .map((oa, i) => {
                                // to do: we should maybe not send all fields to the
                                // user by default
                                const on = { ...oa };
                                // we only send information about the open slots to
                                // the user...
                                on.slotData = on.slotData.filter(sl => sl.open);
                                on.grants = grantsData[i];
                                return on;
                            }),
                    };
                    // we first encrypt the data
                    const encryptedUserData = await ecdhEncrypt(
                        JSON.stringify(userData),
                        token.keyPair,
                        token.encryptedData.publicKey
                    );
                    // we sign the data with our private key
                    const signedEncryptedUserData = await sign(
                        keyPairs.signing.privateKey,
                        JSON.stringify(encryptedUserData),
                        keyPairs.signing.publicKey
                    );
                    dataToSubmit.push({
                        id: token.data.id,
                        data: signedEncryptedUserData,
                        permissions: [
                            {
                                rights: ['read'],
                                keys: [token.data.publicKey],
                            },
                        ],
                    });
                } catch (e) {
                    console.error(e);
                    continue;
                }
            }
            backend.local.set('provider::tokens::open', openTokens);

            // we send the signed, encrypted data to the backend
            await backend.appointments.bulkStoreData(
                { dataList: dataToSubmit },
                keyPairs.signing
            );

            return { status: 'succeeded' };
        } catch (e) {
            console.error(e);
            return { status: 'failed', error: e };
        }
    } finally {
        backend.local.unlock();
    }
}

sendInvitations.actionName = 'sendInvitations';
