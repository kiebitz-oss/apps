// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt } from 'helpers/crypto';
import { base322buf } from 'helpers/conversion';
import { markAsLoading } from 'helpers/actions';

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
            providerData: backend.local.get('provider::data'),
            appointments: backend.local.get('provider::appointments::open'),
            verifiedProviderData: backend.local.get('provider::data::verified'),
            openTokens: backend.local.get('provider::tokens::open'),
            providerDataEncryptionKey: backend.local.get(
                'provider::data::encryptionKey'
            ),
        };
        const encryptedData = await aesEncrypt(
            JSON.stringify(data),
            base322buf(secret)
        );

        return {
            status: 'succeeded',
            data: encryptedData,
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

encryptBackupData.actionName = 'encryptBackupData';
