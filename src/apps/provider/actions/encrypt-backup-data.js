// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt } from 'helpers/crypto';
import { base322buf } from 'helpers/conversion';
import { markAsLoading } from 'helpers/actions';

export const dataMap = {
    keyPairs: 'provider::keyPairs',
    providerData: 'provider::data',
    appointments: 'provider::appointments::open',
    verifiedProviderData: 'provider::data::verified',
    openTokens: 'provider::tokens::open',
    providerDataEncryptionKey: 'provider::data::encryptionKey',
};

// make sure the signing and encryption key pairs exist
export async function encryptBackupData(
    state,
    keyStore,
    settings,
    keyPairs,
    secret
) {
    const backend = settings.get('backend');
    try {
        await backend.local.lock();
        const data = {
            keyPairs: keyPairs,
        };
        for (const [k, v] of Object.entries(dataMap)) {
            data[k] = backend.local.get(v);
        }

        // we store the version and creation date as well
        data.version = '0.1';
        data.createdAt = new Date().toISOString();

        const encryptedData = await aesEncrypt(
            JSON.stringify(data),
            base322buf(secret)
        );

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
        backend.local.unlock();
    }
}

encryptBackupData.actionName = 'encryptBackupData';
