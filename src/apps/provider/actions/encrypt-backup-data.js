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
    try {
        const data = {
            keyPairs: keyPairs,
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
    }
}
