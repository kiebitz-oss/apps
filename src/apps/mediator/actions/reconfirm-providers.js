// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign, ecdhDecrypt, ephemeralECDHEncrypt } from 'helpers/crypto';

export async function reconfirmProviders(
    state,
    keyStore,
    settings,
    providers,
    keyPairs
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('reconfirmProviders');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    keyStore.set({ status: 'inProgress', i: 0, n: providers.length });

    let i = 0;
    for (const providerData of providers) {
        i++;
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
            if (providerData.data.code !== undefined)
                delete providerData.data.code;

            const publicProviderData = {
                name: providerData.data.name,
                street: providerData.data.street,
                city: providerData.data.city,
                zipCode: providerData.data.zipCode,
                website: providerData.data.website,
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

            keyStore.set({
                status: 'inProgress',
                i: i,
                n: providers.length,
            });
        } finally {
            backend.local.unlock('reconfirmProviders');
        }
    }
    return {
        status: 'succeeded',
    };
}

reconfirmProviders.init = () => ({ status: 'initialized' });

reconfirmProviders.actionName = 'reconfirmProviders';
