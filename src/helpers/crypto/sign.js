// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { b642buf, buf2b64, str2ab } from 'helpers/conversion';
import { e } from 'helpers/async';

export async function sign(keyData, rawData, publicKeyData) {
    const data = str2ab(rawData);
    try {
        // we import the key data
        const key = await e(
            crypto.subtle.importKey(
                'jwk',
                keyData,
                { name: 'ECDSA', namedCurve: 'P-256' },
                false,
                ['sign']
            )
        );

        const result = await e(
            crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, data)
        );
        const d = { signature: buf2b64(result), data: rawData };
        if (publicKeyData !== undefined) d.publicKey = publicKeyData;
        return d;
    } catch (e) {
        console.error(e);
    }
    return null;
}
