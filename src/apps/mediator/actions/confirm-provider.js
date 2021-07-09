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
        await backend.local.lock('confirmProvider');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const keyHashesData = {
            signing: providerData.publicKeys.signing,
            encryption: providerData.publicKeys.encryption,
            queueData: {
                zipCode: providerData.data.zipCode,
                accessible: providerData.data.accessible,
            },
            queues: providerData.data.queues, // so we know which queues the provider can query
        };

        const keysJSONData = JSON.stringify(keyHashesData);

        // we remove the 'code' field from the provider
        if (providerData.data.code !== undefined) delete providerData.data.code;

        const publicProviderData = {
            name: providerData.data.name,
            street: providerData.data.street,
            city: providerData.data.city,
            zipCode: providerData.data.zipCode,
            website: providerData.data.website,
            description: providerData.data.description,
        };

        const publicProviderJSONData = JSON.stringify(publicProviderData);
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

        const signedPublicProviderData = await sign(
            keyPairs.signing.privateKey,
            publicProviderJSONData,
            keyPairs.signing.publicKey
        );

        const fullData = {
            queuePrivateKeys: queuePrivateKeys,
            signedData: signedProviderData,
            signedPublicData: signedPublicProviderData,
        };

        // we encrypt the data with the public key supplied by the provider
        const [encryptedProviderData, _] = await ephemeralECDHEncrypt(
            JSON.stringify(fullData),
            providerData.entry.encryptedData.publicKey
        );

        const result = await backend.appointments.confirmProvider(
            {
                id: providerData.id, // the ID of the unverified data
                verifiedID: providerData.verifiedID, // the ID to store the data under
                encryptedProviderData: encryptedProviderData,
                publicProviderData: signedPublicProviderData,
                signedKeyData: signedKeyData,
            },
            keyPairs.signing
        );

        return {
            status: 'suceeded',
            data: result,
        };
    } finally {
        backend.local.unlock('confirmProvider');
    }
}

confirmProvider.actionName = 'confirmProvider';
