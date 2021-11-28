// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt, deriveSecrets } from 'helpers/crypto';
import { base322buf, b642buf } from 'helpers/conversion';
import { markAsLoading } from 'helpers/actions';

export const localKeys = ['keyPairs'];
export const cloudKeys = [
    'data',
    'data::verified',
    'data::encryptionKeyPair',
    'appointments::open', // to do: remove
    'bookings::list', // to do: remove
];

// make sure the signing and encryption key pairs exist
export async function backupData(
    state,
    keyStore,
    settings,
    keyPairs,
    secret,
    lockName
) {
    const backend = settings.get('backend');

    if (lockName === undefined) lockName = 'backupData';

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock(lockName);
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const data = {};

        const loggedOut = backend.local.get('provider::loggedOut', false);

        if (loggedOut) return;

        for (const key of localKeys) {
            data[key] = backend.local.get(`provider::${key}`);
        }

        const cloudData = {};
        for (const key of cloudKeys) {
            const v = backend.local.get(`provider::${key}`);
            cloudData[key] = v;
            // we also store the data locally so that we can restore it from
            // there in case something goes wrong with the cloud backup...
            data[key] = v;
        }

        const referenceData = { local: { ...data }, cloud: { ...cloudData } };
        if (state !== undefined && state.referenceData != undefined) {
            if (
                JSON.stringify(state.referenceData) ===
                JSON.stringify(referenceData)
            ) {
                return state;
            }
        }

        cloudData.version = '0.2';
        cloudData.createdAt = new Date().toISOString();

        data.version = '0.2';
        data.createdAt = new Date().toISOString();

        // locally stored data
        const encryptedData = await aesEncrypt(
            JSON.stringify(data),
            base322buf(secret)
        );

        const [id, key] = await deriveSecrets(b642buf(keyPairs.sync), 32, 2);

        // cloud stored data
        const encryptedCloudData = await aesEncrypt(
            JSON.stringify(cloudData),
            b642buf(key)
        );

        await backend.storage.storeSettings({
            id: id,
            data: encryptedCloudData,
        });

        return {
            status: 'succeeded',
            data: encryptedData,
            referenceData: referenceData,
        };
    } catch (e) {
        console.error(e);
        return {
            status: 'failed',
            error: e,
        };
    } finally {
        if (lockName === 'logout') {
            backend.local.set('provider::loggedOut', true);
            // we make sure not other tasks are executed after this task
            backend.local.clearLocks();
        } else {
            backend.local.unlock(lockName);
        }
    }
}

backupData.actionName = 'backupData';
