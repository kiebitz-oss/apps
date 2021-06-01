// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { generateECDHKeyPair } from './generate-key';
import { b642buf, buf2b64, str2ab, ab2str } from 'helpers/conversion';
import { e } from 'helpers/async';

export async function ecdhEncrypt(rawData, keyPair, publicKeyData) {
    const data = str2ab(rawData);

    try {
        const publicKey = await e(
            crypto.subtle.importKey(
                'spki',
                b642buf(publicKeyData),
                { name: 'ECDH', namedCurve: 'P-256' },
                true,
                []
            )
        );

        const privateKey = await e(
            crypto.subtle.importKey(
                'jwk',
                keyPair.privateKey,
                { name: 'ECDH', namedCurve: 'P-256' },
                false,
                ['deriveKey']
            )
        );

        const symmetricKey = await e(
            crypto.subtle.deriveKey(
                {
                    name: 'ECDH',
                    public: publicKey,
                },
                privateKey,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt']
            )
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encryptedData = await e(
            crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    tagLength: 32, // to do: validate that 32 is acceptable
                    iv: iv,
                },
                symmetricKey,
                data
            )
        );

        return {
            iv: buf2b64(iv),
            data: buf2b64(encryptedData),
            publicKey: keyPair.publicKey,
        };
    } catch (e) {
        return null;
    }
}

export async function ephemeralECDHEncrypt(rawData, publicKeyData) {
    const data = str2ab(rawData);

    try {
        // we generate an ephemeral ECDH key pair
        const ephemeralKeyPair = await e(generateECDHKeyPair());

        const publicKey = await e(
            crypto.subtle.importKey(
                'spki',
                b642buf(publicKeyData),
                { name: 'ECDH', namedCurve: 'P-256' },
                true,
                []
            )
        );
        const privateKey = await e(
            crypto.subtle.importKey(
                'jwk',
                ephemeralKeyPair.privateKey,
                { name: 'ECDH', namedCurve: 'P-256' },
                false,
                ['deriveKey']
            )
        );

        const symmetricKey = await e(
            crypto.subtle.deriveKey(
                {
                    name: 'ECDH',
                    public: publicKey,
                },
                privateKey,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt']
            )
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encryptedData = await e(
            crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    tagLength: 32, // to do: validate that 32 is acceptable
                    iv: iv,
                },
                symmetricKey,
                data
            )
        );

        // we return the data and the public ephemeral key (which the receiver needs to derive
        // the symmetric key using his/her private key)
        return [
            {
                iv: buf2b64(iv),
                data: buf2b64(encryptedData),
                publicKey: ephemeralKeyPair.publicKey,
            },
            ephemeralKeyPair.privateKey,
        ];
    } catch (e) {
        return null;
    }
}

export async function ecdhDecrypt(data, privateKeyData) {
    try {
        const privateKey = await e(
            crypto.subtle.importKey(
                'jwk',
                privateKeyData,
                { name: 'ECDH', namedCurve: 'P-256' },
                false,
                ['deriveKey']
            )
        );

        const publicKey = await e(
            crypto.subtle.importKey(
                'spki',
                b642buf(data.publicKey),
                { name: 'ECDH', namedCurve: 'P-256' },
                true,
                []
            )
        );

        const symmetricKey = await e(
            crypto.subtle.deriveKey(
                {
                    name: 'ECDH',
                    public: publicKey,
                },
                privateKey,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt']
            )
        );

        const decryptedData = await e(
            crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    tagLength: 32, // to do: validate that 32 is acceptable
                    iv: b642buf(data.iv),
                },
                symmetricKey,
                b642buf(data.data)
            )
        );
        return ab2str(decryptedData);
    } catch (e) {
        return null;
    }
}
