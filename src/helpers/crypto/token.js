// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { b642buf, buf2b64, str2ab } from 'helpers/conversion';
import { e } from 'helpers/async';

// salt for the key derivation (public information)
const salt = b642buf(
    '352b73ebd067e1c17996ee2180dbd8a339de2ed97c3604a346ca07917a71091193003f56465a097c98aa572373969057'
);

export async function deriveToken(key, secret, n) {
    const keyBytes = b642buf(key);
    const secretBytes = b642buf(secret);

    const fullKeyBytes = new Int8Array(keyBytes.length + secretBytes.length);
    fullKeyBytes.set(keyBytes);
    fullKeyBytes.set(secretBytes, keyBytes.length);

    const secretKey = await e(
        crypto.subtle.importKey('raw', fullKeyBytes, 'HKDF', false, [
            'deriveBits',
        ])
    );

    const token = await e(
        crypto.subtle.deriveBits(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: salt, // this is public information
                info: str2ab(`${n}`),
            },
            secretKey,
            256
        )
    );

    return buf2b64(token);
}
