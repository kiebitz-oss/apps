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

export async function renewToken(state, keyStore, settings, queueData, queue) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        keyStore.set({ status: 'submitting' });
        let tokenData = backend.local.get('user::tokenData');

        if (tokenData === null) {
            return {
                status: 'failed',
            };
        }

        try {
            // we already have a token, we just renew it
            await backend.appointments.getToken({
                hash: tokenData.dataHash,
                encryptedData: tokenData.encryptedTokenData,
                queueID: queue.id,
                queueData: queueData,
                signedTokenData: tokenData.signedToken,
            });

            return {
                data: tokenData,
                status: 'suceeded',
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e,
            };
        }
    } finally {
        backend.local.unlock();
    }
}

renewToken.reset = () => ({ status: 'initialized' });

renewToken.actionName = 'renewToken';
