// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { backupKeys } from './backup-data';
import { initLocalStorageFromSecret } from '../../../../kiebitz/user/backup';

// make sure the signing and encryption key pairs exist
export async function restoreFromBackup(state, keyStore, settings, secret) {
    try {
        // TODO: What is `dd`?
        // TODO: Throw null error if locking fails.
        const dd = await initLocalStorageFromSecret(secret, backupKeys);
   
        backend.local.set('user::secret', secret);

        return {
            status: 'succeeded',
            data: dd,
        };
    } catch (error) {
        console.error(error);
        return {
            status: 'failed',
            error,
        };
    }
}

restoreFromBackup.actionName = 'restoreFromBackup';
