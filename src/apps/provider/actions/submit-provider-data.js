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

        const [encryptedData, privateKey] = await ephemeralECDHEncrypt(
            jsonData,
            providerDataKey
        );

        // we store the provider data key so we can decrypt the data later
        backend.local.set('provider::data::encryptionKey', privateKey);

        try {
            const result = await backend.appointments.storeProviderData(
                {
                    id: data.id,
                    encryptedData: encryptedData,
                    code: data.data.code,
                },
                keyPairs.signing
            );

            data.data.submitted = true;
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
        backend.local.unlock();
    }
}

submitProviderData.actionName = 'submitProviderData';
submitProviderData.reset = () => ({ status: 'initialized' });
