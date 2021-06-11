// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    generateECDSAKeyPair,
    ephemeralECDHEncrypt,
    randomBytes,
    hashString,
} from 'helpers/crypto';

async function hashContactData(data) {
    const hashData = {
        name: data.name,
        nonce: randomBytes(32),
    };

    const hashDataJSON = JSON.stringify(hashData);
    const dataHash = await hashString(hashDataJSON);
    return [dataHash, hashData.nonce];
}

export async function submitToQueue(
    state,
    keyStore,
    settings,
    contactData,
    queueData,
    queue,
    userSecret
) {
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
        if (tokenData !== null) {
            try {
                // we already have a token, we just submit to another queue
                const signedToken = await backend.appointments.getToken({
                    hash: tokenData.dataHash,
                    code: contactData.code,
                    encryptedData: tokenData.encryptedTokenData,
                    queueID: queue.id,
                    queueData: queueData,
                    signedTokenData: tokenData.signedToken,
                });

                tokenData.signedToken = signedToken;

                backend.local.set('user::tokenData', tokenData);

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
        }
        try {
            // we hash the user data to prove it didn't change later...
            const [dataHash, nonce] = await hashContactData(contactData);
            const signingKeyPair = await generateECDSAKeyPair();

            const userToken = {
                // we use the user secrets first 4 digits as a code
                // this weakens the key a bit but the provider has access to all
                // of the user's appointment data anyway...
                code: userSecret.slice(0, 4),
                publicKey: signingKeyPair.publicKey, // the signing key to control the ID
                id: randomBytes(32), // the ID where we want to receive data
            };

            // we encrypt the token data so the provider can decrypt it...
            const [encryptedTokenData, privateKey] = await ephemeralECDHEncrypt(
                JSON.stringify(userToken),
                queue.publicKey
            );

            // currently we don't give the provider any infos...
            const contactDataForProvider = {};

            // we also encrypt the contact data for the provider...
            // this won't get sent to the provider immediately though...
            const [encryptedContactData] = await ephemeralECDHEncrypt(
                JSON.stringify(contactDataForProvider),
                queue.publicKey
            );

            const signedToken = await backend.appointments.getToken({
                hash: dataHash,
                code: contactData.code,
                encryptedData: encryptedTokenData,
                queueID: queue.id,
                queueData: queueData,
            });

            tokenData = {
                signedToken: signedToken,
                signingKeyPair: signingKeyPair,
                encryptedTokenData: encryptedTokenData,
                encryptedContactData: encryptedContactData,
                queueData: queueData,
                privateKey: privateKey,
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
        backend.local.unlock();
    }
}

submitToQueue.reset = () => ({ status: 'initialized' });

submitToQueue.actionName = 'submitToQueue';
