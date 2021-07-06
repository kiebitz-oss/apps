// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { exportLocalStorageToSecret } from '../../../../kiebitz/user/backup';

export const backupKeys = [
    'grantID',
    'tokenData',
    'invitation',
    'invitation::verified',
    'invitation::accepted',
    'invitation::slots',
    'invitation::grantID',
    'secret',
];

// make sure the signing and encryption key pairs exist
export async function backupData(state, keyStore, settings, secret, lockName) {
    const backend = settings.get('backend');

    if (lockName === undefined) lockName = 'backupData';

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock(lockName);
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        // TODO: If locking doesn't work throw null exception.
        const [referenceData, data] = await exportLocalStorageToSecret(secret, backupKeys);

        // TODO: Fix type coercion or add eslint ignore + comment if on purpose.
        if (state !== undefined && state.referenceData != undefined) {
            if (JSON.stringify(state.referenceData) === JSON.stringify(referenceData)) {
                return state;
            }
        }

        return {
            status: 'succeeded',
            referenceData,
            data,
        };
    } catch (error) {
        console.error(error);
        return {
            status: 'failed',
            error,
        };
    } finally {
        backend.local.unlock(lockName);
    }
}

backupData.actionName = 'backupData';
