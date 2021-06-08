// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from 'helpers/crypto';
import { base322buf, b642buf } from 'helpers/conversion';
import { localKeys, cloudKeys } from './backup-data';

export async function restoreFromBackup(
    state,
    keyStore,
    settings,
    secret,
    data
) {
    const backend = settings.get('backend');
    try {
        await backend.local.lock();

        const dd = JSON.parse(await aesDecrypt(data, base322buf(secret)));

        if (dd === null)
            return {
                status: 'failed',
                error: {
                    message: 'decryption failed',
                },
            };

        for (const key of localKeys) {
            backend.local.set(`provider::${key}`, dd[key]);
        }

        backend.local.set('provider::secret', secret);

        const [id, key] = await deriveSecrets(b642buf(dd.keyPairs.sync), 32, 2);

        const cloudData = await backend.storage.getSettings({ id: id });
        const ddCloud = JSON.parse(await aesDecrypt(cloudData, b642buf(key)));

        for (const key of cloudKeys) {
            backend.local.set(`provider::${key}`, ddCloud[key]);
        }

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
