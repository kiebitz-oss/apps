// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { generateECDSAKeyPair, ephemeralECDHEncrypt } from 'helpers/crypto';

async function hashContactData(data) {
    const hashData = {
        name: data.name,
        nonce: randomBytes(32),
    };

    const hashDataJSON = JSON.stringify(hashData);
    const dataHash = await e(hashString(hashDataJSON));
    return [dataHash, hashData.nonce];
}

export async function submitToQueue(
    state,
    keyStore,
    settings,
    contactData,
    queueData,
    queue
) {
    const backend = settings.get('backend');
    keyStore.set({ status: 'submitting' });
    let tokenData = backend.local.get('user::tokenData');
    if (tokenData !== null) {
        try {
            // we already have a token, we just submit to another queue
            const signedToken = await e(
                backend.appointments.getToken(
                    tokenData.dataHash,
                    tokenData.encryptedTokenData,
                    queue.id,
                    queueData,
                    tokenData.signedToken
                )
            );
            return {
                data: signedToken,
                status: 'suceeded',
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e.toString(),
            };
        }
    }
    try {
        // we hash the user data to prove it didn't change later...
        const [dataHash, nonce] = await e(hashContactData(contactData));
        const signingKeyPair = await e(generateECDSAKeyPair());
        const tokenData = {
            publicKey: signingKeyPair.publicKey, // the signing key to control the ID
            id: randomBytes(32), // the ID where we want to receive data
        };
        // we encrypt the token data so the provider can decrypt it...
        const [encryptedTokenData] = await e(
            ephemeralECDHEncrypt(JSON.stringify(tokenData), queue.publicKey)
        );
        // we also encrypt the contact data for the provider...
        // this won't get sent to the provider immediately though...
        const [encryptedContactData] = await ephemeralECDHEncrypt(
            JSON.stringify(contactData),
            queue.publicKey
        );

        const signedToken = await e(
            backend.appointments.getToken(
                dataHash,
                encryptedTokenData,
                queue.id,
                queueData
            )
        );
        backend.local.set('user::tokenData', {
            signedToken: signedToken,
            signingKeyPair: signingKeyPair,
            encryptedTokenData: encryptedTokenData,
            encryptedContactData: encryptedContactData,
            queueData: queueData,
            hashNonce: nonce,
            dataHash: dataHash,
            tokenData: tokenData,
        });
        return {
            data: signedToken,
            status: 'succeeded',
        };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}
