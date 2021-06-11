// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt, deriveSecrets } from 'helpers/crypto';
import { base322buf, b642buf } from 'helpers/conversion';

export const backupKeys = [
    'tokenData',
    'invitation',
    'invitation::verified',
    'invitation::accepted',
    'secret',
];

// make sure the signing and encryption key pairs exist
export async function backupData(state, keyStore, settings, secret) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const data = {};

        for (const key of backupKeys) {
            data[key] = backend.local.get(`user::${key}`);
        }

        const fullData = {
            ...data,
            version: '0.1',
            createdAt: new Date().toISOString(),
        };

        const [id, key] = await deriveSecrets(base322buf(secret), 32, 2);

        const encryptedData = await aesEncrypt(
            JSON.stringify(fullData),
            b642buf(key)
        );

        if (state !== undefined && state.referenceData != undefined) {
            if (JSON.stringify(state.referenceData) === JSON.stringify(data)) {
                return state;
            }
        }

        await backend.storage.storeSettings({ id: id, data: encryptedData });

        return {
            status: 'succeeded',
            data: encryptedData,
            referenceData: data,
        };
    } catch (e) {
        console.error(e);
        return {
            status: 'failed',
            error: e,
        };
    } finally {
        backend.local.unlock();
    }
}

backupData.actionName = 'backupData';
