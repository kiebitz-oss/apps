// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign, ecdhDecrypt, ephemeralECDHEncrypt } from 'helpers/crypto';

export async function confirmProvider(
    state,
    keyStore,
    settings,
    providerData,
    keyPairs
) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

        const keyHashesData = {
            signing: providerData.publicKeys.signing,
            encryption: providerData.publicKeys.encryption,
            zipCode: providerData.data.zipCode, // so we can calculate distances
            queues: providerData.data.queues, // so we know which queues the provider can query
        };

        const keysJSONData = JSON.stringify(keyHashesData);
        const providerJSONData = JSON.stringify(providerData.data);

        const signedKeyData = await sign(
            keyPairs.signing.privateKey,
            keysJSONData,
            keyPairs.signing.publicKey
        );

        const queues = await backend.appointments.getQueuesForProvider(
            { queueIDs: providerData.data.queues },
            keyPairs.signing
        );

        const queuePrivateKeys = [];
        for (const queue of queues) {
            console.log(keyPairs);
            const queuePrivateKey = await ecdhDecrypt(
                queue.encryptedPrivateKey,
                keyPairs.queue.privateKey
            );
            console.log(queuePrivateKey);
            queuePrivateKeys.push({
                privateKey: queuePrivateKey,
                id: queue.id,
            });
        }

        // this will be stored for the provider, so we add the public key data
        const signedProviderData = await sign(
            keyPairs.signing.privateKey,
            providerJSONData,
            keyPairs.signing.publicKey
        );

        const fullData = {
            queuePrivateKeys: queuePrivateKeys,
            signedData: signedProviderData,
        };

        // we encrypt the data with the public key supplied by the provider
        const [encryptedProviderData, _] = await ephemeralECDHEncrypt(
            JSON.stringify(fullData),
            providerData.entry.encryptedData.publicKey
        );

        const result = await backend.appointments.confirmProvider(
            {
                id: providerData.verifiedID, // the ID to store the data under
                encryptedProviderData: encryptedProviderData,
                signedKeyData: signedKeyData,
            },
            keyPairs.signing
        );

        return {
            status: 'suceeded',
            data: result,
        };
    } finally {
        backend.local.unlock();
    }
}

confirmProvider.actionName = 'confirmProvider';
