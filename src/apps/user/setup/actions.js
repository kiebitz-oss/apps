// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    hashString,
    randomBytes,
    ephemeralECDHEncrypt,
    generateECDSAKeyPair,
} from 'helpers/crypto';
import { buf2base32, b642buf } from 'helpers/conversion';

import { e } from 'helpers/async';

async function hashContactData(data) {
    const hashData = {
        name: data.name,
        nonce: randomBytes(32),
    };

    const hashDataJSON = JSON.stringify(hashData);
    const dataHash = await e(hashString(hashDataJSON));
    return [dataHash, hashData];
}

async function getTokenData(state, keyStore, settings, queue) {
    const data = {};
}

export async function submitToQueue(state, keyStore, settings, data, queue) {
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
        const [dataHash, hashData] = await e(hashContactData(data));
        const signingKeyPair = await e(generateECDSAKeyPair());
        const tokenData = {
            publicKey: signingKeyPair.publicKey, // the signing key to control the ID
            id: randomBytes(32), // the ID where we want to receive data
        };
        const tokenDataJSON = JSON.stringify(tokenData);
        // we encrypt the token data so the provider can decrypt it...
        const [encryptedTokenData, privateKey] = await e(
            ephemeralECDHEncrypt(tokenDataJSON, queue.publicKey)
        );

        const signedToken = await e(
            backend.appointments.getToken(
                dataHash,
                encryptedTokenData,
                queue.id
            )
        );
        backend.local.set('user::tokenData', {
            signedToken: signedToken,
            signingKeyPair: signingKeyPair,
            hashData: hashData,
            dataHash: dataHash,
            tokenData: tokenData,
            encryptedTokenData: encryptedTokenData,
            privateKey: privateKey,
        });
        return {
            data: signedToken,
            status: 'succeeded',
        };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

export async function userSecret(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    if (data !== undefined) backend.local.set('user::secret', data);
    data = backend.local.get('user::secret');
    if (data === null)
        return {
            status: 'failed',
        };
    return {
        status: 'loaded',
        data: data,
    };
}

userSecret.init = (keyStore, settings) => {
    const backend = settings.get('backend');
    let data = backend.local.get('user::secret');
    if (data === null || true) {
        data = buf2base32(b642buf(randomBytes(10)));
        backend.local.set('user::secret', data);
    }
    return {
        status: 'loaded',
        data: data,
    };
};

export async function contactData(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    // we just store the data...
    if (data !== undefined) backend.local.set('user::contactData', data);
    data = backend.local.get('user::contactData');
    if (data === null)
        return {
            status: 'failed',
        };
    return {
        status: 'loaded',
        data: data,
    };
}
