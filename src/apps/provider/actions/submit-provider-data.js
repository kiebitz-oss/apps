// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ephemeralECDHEncrypt, sign } from 'helpers/crypto';

// store the provider data for validation in the backend
export async function submitProviderData(
    state,
    keyStore,
    settings,
    data,
    keyPairs,
    keys
) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
        const dataToEncrypt = Object.assign({}, data);
        dataToEncrypt.publicKeys = {
            signing: keyPairs.signing.publicKey,
            encryption: keyPairs.encryption.publicKey,
        };

        const providerDataKey = keys.providerData;

        // we convert the data to JSON
        const jsonData = JSON.stringify(dataToEncrypt);
        const [encryptedData, privateKey] = await ephemeralECDHEncrypt(
            jsonData,
            providerDataKey
        );

        const encryptedJSONData = JSON.stringify(encryptedData);

        // we store the provider data key so we can decrypt the data later
        backend.local.set('provider::data::encryptionKey', privateKey);

        const signedData = await sign(
            keyPairs.signing.privateKey,
            encryptedJSONData,
            keyPairs.signing.publicKey
        );

        try {
            const result = await backend.appointments.storeProviderData(
                data.id,
                signedData
            );

            const providerData = backend.local.get('provider::data', {});
            providerData.submitted = true;
            backend.local.set('provider::data', providerData);

            return result;
        } catch (e) {
            return { status: 'failed', error: e.toString() };
        }
    } finally {
        backend.local.unlock();
    }
}
