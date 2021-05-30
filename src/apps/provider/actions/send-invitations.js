// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    sign,
    ecdhEncrypt,
    ecdhDecrypt,
    generateECDHKeyPair,
} from 'helpers/crypto';

function getQueuePrivateKey(queueID, verifiedProviderData) {
    for (const queueKeys of verifiedProviderData.queuePrivateKeys) {
        if (queueKeys.id === queueID) return queueKeys.privateKey;
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
        let openTokens = backend.local.get('provider::tokens::open', []);
        if (openAppointments.length === 0)
            // we don't have any new appointments to give out
            return {
                status: 'succeeded',
            };
        try {
            const n = Math.max(0, openAppointments.length - openTokens.length);
            // we don't have enough tokens for our open appointments, we generate more
            if (n > 0) {
                const signedData = await sign(
                    [{ n: 10 }],
                    keyPairs.signing.privateKey,
                    keyPairs.signing.publicKey
                );
                const newTokens = await backend.appointments.getQueueTokens(
                    signedData
                );
                for (const token of newTokens) {
                    token.keyPair = await generateECDHKeyPair();
                }
                openTokens = [...openTokens, ...newTokens];
                // we update the list of open tokens
                backend.local.set('provider::tokens::open', openTokens);
            }
            const dataToSubmit = [];
            // we make sure all token holders can initialize all appointment data IDs
            for (const token of openTokens) {
                const privateKey = getQueuePrivateKey(
                    token.queue,
                    verifiedProviderData
                );
                try {
                    const decryptedTokenJSONData = await ecdhDecrypt(
                        token.token.encryptedData,
                        privateKey
                    );
                    const decryptedTokenData = JSON.parse(
                        decryptedTokenJSONData
                    );
                    // we generate grants for all appointments IDs
                    const grantsData = await Promise.all(
                        openAppointments.map(
                            async oa =>
                                await sign(
                                    keyPairs.signing.privateKey,
                                    JSON.stringify({
                                        rights: ['write', 'read', 'delete'],
                                        single_use: true,
                                        id: oa.id,
                                        permissions: [
                                            {
                                                rights: [
                                                    'write',
                                                    'read',
                                                    'delete',
                                                ],
                                                keys: [
                                                    keyPairs.signing.publicKey,
                                                ],
                                            },
                                        ],
                                    }),
                                    keyPairs.signing.publicKey
                                )
                        )
                    );
                    const userData = {
                        provider: verifiedProviderData.signedData,
                        offers: openAppointments.map((oa, i) => {
                            const on = { ...oa };
                            on.grant = grantsData[i];
                            return on;
                        }),
                    };
                    // we first encrypt the data
                    const encryptedUserData = await ecdhEncrypt(
                        JSON.stringify(userData),
                        token.keyPair,
                        token.token.encryptedData.publicKey
                    );
                    // we sign the data with our private key
                    const signedEncryptedUserData = await sign(
                        keyPairs.signing.privateKey,
                        JSON.stringify(encryptedUserData),
                        keyPairs.signing.publicKey
                    );
                    dataToSubmit.push({
                        id: decryptedTokenData.id,
                        data: signedEncryptedUserData,
                        permissions: [
                            {
                                rights: ['read'],
                                keys: [decryptedTokenData.publicKey],
                            },
                        ],
                    });
                } catch (e) {
                    console.log(e.toString());
                    continue;
                }
            }
            backend.local.set('provider::tokens::open', openTokens);
            // we send the signed, encrypted data to the backend
            await backend.appointments.bulkStoreData(
                keyPairs.signing,
                dataToSubmit
            );

            return { status: 'succeeded' };
        } catch (e) {
            console.log(e.toString());
            return { status: 'failed', error: e.toString() };
        }
    } finally {
        backend.local.unlock();
    }
}
