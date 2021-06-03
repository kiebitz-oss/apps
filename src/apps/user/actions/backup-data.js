// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt, deriveSecrets } from 'helpers/crypto';
import { base322buf, b642buf } from 'helpers/conversion';

// make sure the signing and encryption key pairs exist
export async function backupData(state, keyStore, settings, tokenData, secret) {
    const backend = settings.get('backend');
    try {
        const data = {
            tokenData: tokenData,
        };

        const [id, key] = await deriveSecrets(base322buf(secret), 32, 2);

        const encryptedData = await aesEncrypt(
            JSON.stringify(data),
            b642buf(key)
        );

        await backend.storage.storeSettings({ id: id, data: encryptedData });

        return {
            status: 'succeeded',
            data: encryptedData,
        };
    } catch (e) {
        console.log(e);
        return {
            status: 'failed',
        };
    }
}

backupData.actionName = 'backupData';
