// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { b642buf, str2ab } from 'helpers/conversion';
import { e } from 'helpers/async';

export async function verify(keys, signedData) {
    const signature = b642buf(signedData.signature);
    const data = str2ab(signedData.data);

    for (const keyData of keys) {
        const ab = b642buf(keyData);
        try {
            // we import the key data
            const key = await e(
                crypto.subtle.importKey(
                    'spki',
                    ab,
                    { name: 'ECDSA', namedCurve: 'P-256' },
                    false,
                    ['verify']
                )
            );
            const result = await e(
                crypto.subtle.verify(
                    { name: 'ECDSA', hash: 'SHA-256' },
                    key,
                    signature,
                    data
                )
            );
            if (result === true) {
                return true;
            }
        } catch (e) {
            console.error(e);
            continue;
        }
    }
    // no key signature was valid
    return false;
}
