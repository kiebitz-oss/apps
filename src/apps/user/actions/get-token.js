// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    generateECDSAKeyPair,
    generateECDHKeyPair,
    ephemeralECDHEncrypt,
    randomBytes,
    hashString,
} from 'helpers/crypto';

async function hashContactData(data) {
    const hashData = {
        name: data.name,
        grantSeed: data.grantSeed,
        nonce: randomBytes(32),
    };

    const hashDataJSON = JSON.stringify(hashData);
    const dataHash = await hashString(hashDataJSON);
    return [dataHash, hashData.nonce];
}

export async function getToken(
    state,
    keyStore,
    settings,
    contactData,
    userSecret
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('getToken');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        keyStore.set({ status: 'submitting' });
        try {
            // we hash the user data to prove it didn't change later...
            const [dataHash, nonce] = await hashContactData(contactData);
            const signingKeyPair = await generateECDSAKeyPair();
            const encryptionKeyPair = await generateECDHKeyPair();

            const userToken = {
                // we use the user secrets first 4 digits as a code
                // this weakens the key a bit but the provider has access to all
                // of the user's appointment data anyway...
                code: userSecret.slice(0, 4),
                version: '0.3',
                createdAt: new Date().toISOString(),
                publicKey: signingKeyPair.publicKey, // the signing key to control the ID
                encryptionPublicKey: encryptionKeyPair.publicKey,
                id: randomBytes(32), // the ID where we want to receive data
            };

            const signedToken = await backend.appointments.getToken({
                hash: dataHash,
                publicKey: signingKeyPair.publicKey,
                code: contactData.code,
            });

            const tokenData = {
                createdAt: new Date().toISOString(),
                signedToken: signedToken,
                signingKeyPair: signingKeyPair,
                keyPair: encryptionKeyPair,
                hashNonce: nonce,
                dataHash: dataHash,
                tokenData: userToken,
            };

            backend.local.set('user::tokenData', tokenData);
            return {
                data: tokenData,
                status: 'succeeded',
            };
        } catch (e) {
            return { status: 'failed', error: e };
        }
    } finally {
        backend.local.unlock('getToken');
    }
}

getToken.reset = () => ({ status: 'initialized' });

getToken.actionName = 'getToken';
