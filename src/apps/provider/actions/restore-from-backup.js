// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt } from 'helpers/crypto';
import { base322buf } from 'helpers/conversion';
import { dataMap } from './encrypt-backup-data';

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

        for (const [k, v] of Object.entries(dataMap)) {
            backend.local.set(v, dd[k]);
        }

        backend.local.set('provider::secret', secret);

        return {
            status: 'succeeded',
            data: dd,
        };
    } catch (e) {
        console.log(e);
        return {
            status: 'failed',
        };
    } finally {
        backend.local.unlock();
    }
}

restoreFromBackup.actionName = 'restoreFromBackup';
