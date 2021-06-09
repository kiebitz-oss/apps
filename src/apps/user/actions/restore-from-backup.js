// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { backupKeys } from './backup-data';
import { initLocalStorageFromSecret } from '../business-logic/backup';

// make sure the signing and encryption key pairs exist
export async function restoreFromBackup(state, keyStore, settings, secret) {
    try {
        // TODO: What is `dd`?
        const dd = await initLocalStorageFromSecret(secret, backupKeys);
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
