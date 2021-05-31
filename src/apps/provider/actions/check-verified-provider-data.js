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
        await backend.local.lock();
        const verifiedData = await backend.appointments.getData(
            { id: data.verifiedID },
            keyPairs.signing
        );
        if (verifiedData === null) return { status: 'not-found' };
        const encryptionKey = backend.local.get(
            'provider::data::encryptionKey'
        );
        try {
            const decryptedJSONData = await ecdhDecrypt(
                JSON.parse(verifiedData.data),
                encryptionKey
            );
            if (decryptedJSONData === null) {
                // can't decrypt
                return { status: 'failed' };
            }
            const decryptedData = JSON.parse(decryptedJSONData);
            decryptedData.signedData.json = JSON.parse(
                decryptedData.signedData.data
            );
            backend.local.set('provider::data::verified', decryptedData);
            return { status: 'loaded', data: decryptedData };
        } catch (e) {
            return { status: 'failed' };
        }
    } finally {
        backend.local.unlock();
    }
}
