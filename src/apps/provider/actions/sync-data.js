// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt, deriveSecrets } from 'helpers/crypto';
import { b642buf } from 'helpers/conversion';

// make sure the signing and encryption key pairs exist
export async function syncData(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('syncData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const data = {
            providerData: backend.local.get('provider::data'),
            appointments: backend.local.get('provider::appointments::open'),
            verifiedProviderData: backend.local.get('provider::data::verified'),
            providerDataEncryptionKey: backend.local.get(
                'provider::data::encryptionKey'
            ),
        };

        const [id, key] = await deriveSecrets(b642buf(keyPairs.sync), 32, 2);

        const encryptedData = await aesEncrypt(
            JSON.stringify(data),
            b642buf(key)
        );

        await backend.storage.storeSettings({ id: id, data: encryptedData });

        return {
            status: 'succeeded',
            data: encryptedData,
        };
    } catch (e) {
        console.error(e);
        return {
            status: 'failed',
            error: e,
        };
    } finally {
        backend.local.unlock('syncData');
    }
}

backupData.actionName = 'backupData';
