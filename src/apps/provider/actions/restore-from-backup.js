// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from 'helpers/crypto';
import { base322buf, b642buf } from 'helpers/conversion';
import { localKeys, cloudKeys } from './backup-data';

// to support old backup versions
const dataMap = {
    keyPairs: 'keyPairs',
    providerData: 'data',
    appointments: 'appointments::open',
    verifiedProviderData: 'data::verified',
    openTokens: 'tokens::open',
    providerDataEncryptionKey: 'data::encryptionKey',
};

export async function restoreFromBackup(
    state,
    keyStore,
    settings,
    secret,
    data
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const dd = JSON.parse(await aesDecrypt(data, base322buf(secret)));

        if (dd === null)
            return {
                status: 'failed',
                error: {
                    message: 'decryption failed',
                },
            };

        // to do: remove as soon as everyone's on the new versioned schema
        if (dd.version === undefined || dd.version === '0.1') {
            // this is an old backup file, we restore data from it...
            for (const [k, v] of Object.entries(dataMap)) {
                if (dd[k] !== undefined)
                    backend.local.set(`provider::${v}`, dd[k]);
            }
        }

        for (const key of localKeys) {
            backend.local.set(`provider::${key}`, dd[key]);
        }

        if (dd.keyPairs.sync !== undefined) {
            const [id, key] = await deriveSecrets(
                b642buf(dd.keyPairs.sync),
                32,
                2
            );

            try {
                const cloudData = await backend.storage.getSettings({ id: id });
                const ddCloud = JSON.parse(
                    await aesDecrypt(cloudData, b642buf(key))
                );

                for (const key of cloudKeys) {
                    if (ddCloud[key] !== undefined)
                        backend.local.set(`provider::${key}`, ddCloud[key]);
                }
            } catch (e) {
                console.error(e);
            }
        }

        backend.local.set('provider::secret', secret);

        return {
            status: 'succeeded',
            data: dd,
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

restoreFromBackup.actionName = 'restoreFromBackup';
