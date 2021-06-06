// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { b642buf, buf2b64, str2ab } from 'helpers/conversion';
import { e } from 'helpers/async';

export async function generateSymmetricKey() {
    try {
        const key = await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );
        const keyBytes = await e(crypto.subtle.exportKey('raw', key));
        return buf2b64(keyBytes);
    } catch (e) {
        console.error(e);
    }
    return null;
}

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
        const privKey = await crypto.subtle.exportKey('jwk', key.privateKey);

        return { publicKey: buf2b64(pubKey), privateKey: privKey };
    } catch (e) {
        console.error(e);
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
        const privKey = await e(crypto.subtle.exportKey('jwk', key.privateKey));
        return { publicKey: buf2b64(pubKey), privateKey: privKey };
    } catch (e) {
        console.error(e);
    }
    return null;
}
