// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { b642buf, buf2b64, str2ab } from 'helpers/conversion';
import { e } from 'helpers/async';

export async function generateECDSAKeyPair() {
    try {
        const key = await e(
            crypto.subtle.generateKey(
                { name: 'ECDSA', namedCurve: 'P-256' },
                true,
                ['sign', 'verify']
            )
        );
        const pubKey = await e(crypto.subtle.exportKey('spki', key.publicKey));
        const privKey = await e(
            crypto.subtle.exportKey('pkcs8', key.privateKey)
        );
        return { publicKey: buf2b64(pubKey), privateKey: buf2b64(privKey) };
    } catch (e) {
        console.log(e);
    }
    return null;
}

export async function generateECDHKeyPair() {
    try {
        const key = await e(
            crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: 'P-256' },
                true,
                ['deriveKey']
            )
        );
        const pubKey = await e(crypto.subtle.exportKey('spki', key.publicKey));
        const privKey = await e(
            crypto.subtle.exportKey('pkcs8', key.privateKey)
        );
        return { publicKey: buf2b64(pubKey), privateKey: buf2b64(privKey) };
    } catch (e) {
        console.log(e);
    }
    return null;
}
