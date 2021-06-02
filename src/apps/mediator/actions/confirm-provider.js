// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { hash, sign, ecdhDecrypt, ephemeralECDHEncrypt } from 'helpers/crypto';

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

        // we only store hashes of the public key values, as the actual keys are
        // always passed to the user, so they never need to be looked up...
        const keyHashesData = {
            signing: await hash(providerData.publicKeys.signing),
            encryption: await hash(providerData.publicKeys.encryption),
            zipCode: providerData.data.zipCode, // so we can calculate distances
            queues: providerData.data.queues, // so we know which queues the provider can query
        };

        const keysJSONData = JSON.stringify(keyHashesData);
        const providerJSONData = JSON.stringify(providerData.data);

        // we hash the public key value
        const publicKeyHash = await hash(keyPairs.signing.publicKey);

        // this will be published, so we only store the hashed key
        const signedKeyData = await sign(
            keyPairs.signing.privateKey,
            keysJSONData,
            publicKeyHash
        );

        const queues = await backend.appointments.getQueuesForProvider(
            { queueIDs: providerData.data.queues },
            keyPairs.signing
        );

        const queuePrivateKeys = [];
        for (const queue of queues) {
            const queuePrivateKey = await ecdhDecrypt(
                queue.encryptedPrivateKey,
                keyPairs.queue.privateKey
            );
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
