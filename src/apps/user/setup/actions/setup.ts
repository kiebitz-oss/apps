// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import Base from "actions/base";
import { b642buf, base322buf, buf2b64, str2ab } from "helpers/conversion";
import { e } from "helpers/async";
import { Trace, HDEncryptedContactData, KcEncryptedContactData, TraceData, ContactData, SecretData, EncryptedSecretData } from "helpers/protobuf";

// salt for the key derivation (public information)
const salt = b642buf("352b73ebd067e1c17996ee2180dbd8a339de2ed97c3604a346ca07917a71091193003f56465a097c98aa572373969057")

// generates hashes for contact tracing
async function generateHashes(n){

    const hsBytes = new Uint8Array(32)

    // we generate random key bytes
    crypto.getRandomValues(hsBytes)

    // we derive a proper key from them using HKDF (the key is already cryptographically strong so we e.g. don't need PBKDF2)
    const hs = await e(crypto.subtle.importKey('raw', hsBytes, 'HKDF', false, ['deriveBits']))
    const his = []

    // we derive bits from from the key using HKDF
    for(let i=0;i<n;i++){
        const hi = await e(crypto.subtle.deriveBits(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: salt, // this is public information
                info: str2ab(`${i}`), // we use a number string here for simplicity
            }, hs, 256))
        his.push(buf2b64(hi))
    }
    return {hs: buf2b64(hsBytes), his: his}
}

// Generates and partially encrypts data for contact tracing
async function encryptTraceData(data, hdPublicKeyData){

    const encryptedTraces = []

    for(const hi of data.his){

        const hdPublicKey = await e(crypto.subtle.importKey('raw', b642buf(hdPublicKeyData), {name: 'ECDH', namedCurve: 'P-256'}, true, []))

        const userKey = await e(crypto.subtle.generateKey({
            name: 'ECDH',
            namedCurve: 'P-256',
        }, true, ['deriveKey']))

        const key = await e(crypto.subtle.deriveKey({
            name: 'ECDH',
            public: hdPublicKey,
        }, userKey.privateKey, {
            name: 'AES-GCM',
            length: 256,
        }, true, ['encrypt', 'decrypt']))

        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const ed = await e(crypto.subtle.encrypt({
            name: 'AES-GCM',
            tagLength: 32, // to do: validate that 32 is acceptable
            iv: iv,
        }, key, data.traceData));

        const publicUserKey = await e(crypto.subtle.exportKey('raw', userKey.publicKey))
        const privateUserKey = await e(crypto.subtle.exportKey('jwk', userKey.privateKey))

        encryptedTraces.push({
            publicKey: buf2b64(publicUserKey),
            privateKey: privateUserKey,
            data: buf2b64(ed),
            iv: buf2b64(iv),
            hi: hi,
        })
    }

    return encryptedTraces
}

// encrypts the contact data twice, once with K_c and once with a key
// derived from the public HD key
async function encryptContactData(kaData, kcData, hdPublicKeyData, data){

    const kaBytes = b642buf(kaData)
    const kcBytes = b642buf(kcData)

    // IV for symmetric encryption
    const ivS = window.crypto.getRandomValues(new Uint8Array(12));
    // IV for asymmetric encryption
    const ivA = window.crypto.getRandomValues(new Uint8Array(12));

    // we generate the base key
    const kc = await e(crypto.subtle.importKey('raw', kcBytes, 'AES-GCM', false, ['encrypt', 'decrypt']).catch(e => {throw e}))

    // we first encrypt the data with K_c
    const edS = await e(crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: ivS,
    }, kc, data));

    const kcEncryptedContactData = {
        data: Buffer.from(edS),
        iv: Buffer.from(ivS),
        ka: Buffer.from(kaBytes),
    }

    // pack the encrypted contact data
    const kcEncryptedContactDataPB = KcEncryptedContactData.encode(KcEncryptedContactData.fromObject(kcEncryptedContactData)).finish()

    // then we take the public HD key
    const hdPublicKey = await e(crypto.subtle.importKey('raw', b642buf(hdPublicKeyData), {name: 'ECDH', namedCurve: 'P-256'}, true, []))

    // we generate a new ECDH key
    const userKey = await e(crypto.subtle.generateKey({
        name: 'ECDH',
        namedCurve: 'P-256',
    }, true, ['deriveKey']))

    // we derive a symmetric key from it
    const key = await e(crypto.subtle.deriveKey({
        name: 'ECDH',
        public: hdPublicKey,
    }, userKey.privateKey, {
        name: 'AES-GCM',
        length: 256,
    }, true, ['encrypt', 'decrypt']))

    // we encrypt the data again with the key
    const edA = await e(crypto.subtle.encrypt({
        name: 'AES-GCM',
        tagLength: 32, // to do: validate that 32 is acceptable
        iv: ivA,
    }, key, kcEncryptedContactDataPB));

    // we export the public user key (as the HD needs it to derive a key)
    const publicUserKey = await e(crypto.subtle.exportKey('raw', userKey.publicKey))

    const hdEncryptedContactData = {
        data: Buffer.from(edA),
        iv: Buffer.from(ivA),
        publicKey: Buffer.from(publicUserKey),
    }

    // pack the encrypted contact data
    const hdEncryptedContactDataPB = HDEncryptedContactData.encode(HDEncryptedContactData.fromObject(hdEncryptedContactData)).finish()

    return {
        data: buf2b64(hdEncryptedContactDataPB),
    }
}

// encrypts the secret user data (required for contact tracing) with the
// random secret key generated for the user
async function encryptSecretData(key, data){

    const keyBytes = base322buf(key)

  	const keyMaterial = await e(crypto.subtle.importKey(
	    "raw",
	    keyBytes,
	    "PBKDF2",
	    false,
	    ["deriveBits", "deriveKey"]
	  ));

	const encryptionKey = await e(crypto.subtle.deriveKey(
	    {
	      "name": "PBKDF2",
	      "salt": salt,
	      "iterations": 100000,
	      "hash": "SHA-256"
	    },
	    keyMaterial,
	    { "name": "AES-GCM", "length": 256},
	    true,
	    [ "encrypt", "decrypt" ]
	  ));

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const ed = await e(crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: iv,
    }, encryptionKey, data));

    const encryptedSecretData = {
        data: Buffer.from(ed),
        iv: Buffer.from(iv),
    }

    // pack the encrypted contact data
    const encryptedSecretDataPB = EncryptedSecretData.encode(EncryptedSecretData.fromObject(encryptedSecretData)).finish()
    return {data: buf2b64(encryptedSecretDataPB)}
}

// generates all data required for contact tracing
export async function setup(state, keyStore, settings, ks, hdPublicKey, contactData){

	try {
	    const hashes = await e(generateHashes(200))
		const traceData = {id: Buffer.from(b642buf(ks.uid)), kb: Buffer.from(b642buf(ks.kb))}
	    const traceDataPB = TraceData.encode(TraceData.fromObject(traceData)).finish()
	    // we generate QR code data using the encoded data
	    const encryptedTraces = await e(encryptTraceData({
	        his: hashes.his,
	        traceData: traceDataPB,
	    }, hdPublicKey.data))

		const privateKeys = []
		for(let encryptedTrace of encryptedTraces){
			privateKeys.push({
				ecPrivateKey: encryptedTrace.privateKey,
				ecPublicKey: Buffer.from(b642buf(encryptedTrace.publicKey)),
				iv: Buffer.from(b642buf(encryptedTrace.iv))
			})
            // we delete the private key from the trace data (as we don't need it again locally)
            delete encryptedTrace.privateKey
		}

		const secretData = {
			hs: Buffer.from(b642buf(hashes.hs)),
			id: Buffer.from(b642buf(ks.uid)),
			kb: Buffer.from(b642buf(ks.kb)),
			kis: privateKeys,
		}

		// generate the secret data that the user needs to keep safe or upload encrypted
	    const secretDataPB = SecretData.encode(SecretData.fromObject(secretData)).finish()

	    const encryptedSecretData = await e(encryptSecretData(ks.spwd, secretDataPB))

	    //const encryptedSecretData = await encryptSecretData(...)
	    
	    const contactDataPB = ContactData.encode(ContactData.fromObject(contactData)).finish()
	    // we encrypt the user data
	    const encryptedContactData = await e(encryptContactData(ks.ka, ks.kc, hdPublicKey.data, contactDataPB))

	    return {
            uid: ks.uid, // user ID for contact tracing
            suid: ks.suid, // secret user ID for storing encrypted settings / secret data
            spwd: ks.spwd,
	    	// this will be stored on the tracing server
	    	encryptedContactData: encryptedContactData.data,
	    	// this might be kept local
	    	unencryptedSecretData: buf2b64(secretDataPB),
	    	// this might be stored on a storage server (encrypted)
	    	encryptedSecretData: encryptedSecretData.data,
	    	// this is "semi-public" presented to location operators
	    	encryptedTraces: encryptedTraces,
	    }	
	} catch(e) {
		return {error: e.toString()}
	}

}
