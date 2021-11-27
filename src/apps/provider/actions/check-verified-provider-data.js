// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from 'helpers/crypto';

export async function checkVerifiedProviderData(
    state,
    keyStore,
    settings,
    data,
    keyPairs
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('checkVerifiedProviderData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const verifiedData = await backend.appointments.checkProviderData(
            {},
            keyPairs.signing
        );
        if (verifiedData === null) {
            backend.local.set('provider::data::verified', null);
            return { status: 'not-found' };
        }
        const keyPair = backend.local.get('provider::data::encryptionKeyPair');
        if (keyPair === null) {
            backend.local.set('provider::data::verified', null);
            return {
                status: 'failed',
            };
        }
        try {
            const decryptedJSONData = await ecdhDecrypt(
                verifiedData.encryptedProviderData,
                keyPair.privateKey
            );
            if (decryptedJSONData === null) {
                // can't decrypt
                backend.local.set('provider::data::verified', null);
                return { status: 'failed' };
            }
            const decryptedData = JSON.parse(decryptedJSONData);
            decryptedData.signedData.json = JSON.parse(
                decryptedData.signedData.data
            );
            backend.local.set('provider::data::verified', decryptedData);
            // to do: check signed keys as well
            return { status: 'loaded', data: decryptedData };
        } catch (e) {
            backend.local.set('provider::data::verified', null);
            return { status: 'failed' };
        }
    } catch (e) {
        console.error(e);
        return { status: 'failed' };
    } finally {
        backend.local.unlock('checkVerifiedProviderData');
    }
}

checkVerifiedProviderData.actionName = 'checkVerifiedProviderData';
