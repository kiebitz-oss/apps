// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt, generateECDHKeyPair, sign } from 'helpers/crypto';

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
        await backend.local.lock('submitProviderData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const dataToEncrypt = Object.assign({}, data);

        let keyPair = backend.local.get('provider::data::encryptionKeyPair');

        if (keyPair === null) {
            keyPair = await generateECDHKeyPair();
            backend.local.set('provider::data::encryptionKeyPair', keyPair);
        }

        try {
            const queues = await backend.appointments.getQueues({
                zipCode: data.data.zipCode,
                radius: 50,
            });
            data.data.queues = queues.map(q => q.id);
        } catch (e) {
            return { status: 'failed', error: e };
        }

        dataToEncrypt.publicKeys = {
            signing: keyPairs.signing.publicKey,
            encryption: keyPairs.encryption.publicKey,
        };

        const providerDataKey = keys.providerData;
        // we convert the data to JSON
        const jsonData = JSON.stringify(dataToEncrypt);

        const encryptedData = await ecdhEncrypt(
            jsonData,
            keyPair,
            providerDataKey
        );

        try {
            const result = await backend.appointments.storeProviderData(
                {
                    id: data.id,
                    encryptedData: encryptedData,
                    code: data.data.code,
                },
                keyPairs.signing
            );

            data.submitted = true;
            data.version = '0.3';
            backend.local.set('provider::data', data);
            return {
                status: 'succeeded',
                data: result,
            };
        } catch (e) {
            console.error(e);
            return { status: 'failed', error: e };
        }
    } finally {
        backend.local.unlock('submitProviderData');
    }
}

submitProviderData.actionName = 'submitProviderData';
submitProviderData.reset = () => ({ status: 'initialized' });
