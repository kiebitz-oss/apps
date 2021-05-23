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

import { e } from "helpers/async";
import {
    verify,
    sign,
    hash,
    generateECDSAKeyPair,
    generateECDHKeyPair,
    ephemeralECDHEncrypt,
    ephemeralECDHDecrypt
} from 'helpers/crypto';

export async function confirmProvider(state, keyStore, settings, providerData, keyPairs){

    console.log(providerData)

    // we only store hashes of the public key values, as the actual keys are
    // always passed to the user, so they never need to be looked up...
    const keyHashesData = {
        signing: await e(hash(providerData.publicKeys.signing)),
        encryption: await e(hash(providerData.publicKeys.encryption)),
    }

    const keysJSONData = JSON.stringify(keyHashesData)
    const providerJSONData = JSON.stringify(providerData.data)

    // we hash the public key value
    const publicKeyHash = await e(hash(keyPairs.signing.publicKey))

    // this will be published, so we only store the hashed key
    const signedKeyData = await e(
        sign(keyPairs.signing.privateKey, keysJSONData, publicKeyHash)
    );


    // this will be stored for the provider, so we add the public key data
    const signedProviderData = await e(
        sign(keyPairs.signing.privateKey, providerJSONData, keyPairs.signing.publicKey)
    );

    const entryData = JSON.parse(providerData.entry.data)
    const signedJSONData = JSON.stringify(signedProviderData)

    // we encrypt the data with the public key supplied by the provider
    const [encryptedData, _] = await e(
        ephemeralECDHEncrypt(signedJSONData, entryData.publicKey)
    );

    // this will be stored for the provider, so we add the public key data
    const signedEncryptedData = await e(
        sign(keyPairs.signing.privateKey, encryptedData, keyPairs.signing.publicKey)
    );

    const backend = settings.get('backend')
    const result = await e(backend.appointments.confirmProvider({
        id: providerData.verifiedID, // the ID to store the data under
        key: providerData.entry.publicKey, // for access control
        providerData: signedEncryptedData,
        keyData: signedKeyData,
    }))

    return {
        status: "suceeded",
        data: result,
    }
}

export async function providers(state, keyStore, settings, keyPairs, dataKeyPair) {
    const backend = settings.get('backend');
    keyStore.set({ status: 'loading' });
    try {
        const providersList = await e(
            backend.appointments.getPendingProviderData(keyPairs, 10)
        );
        const invalidEntries = []
        const decryptedProviderList = []
        for(const entry of providersList){
            try {
                const result = await e(verify([entry.publicKey], entry))
                if (!result){
                    // signature is invalid... Actually this is not really
                    // required here as the public key isn't verifiable
                    throw "invalid signature"
                }
                const encryptedData = JSON.parse(entry.data)
                const decryptedJSONData = await e(ephemeralECDHDecrypt(encryptedData, dataKeyPair.privateKey))
                const decryptedData = JSON.parse(decryptedJSONData)
                decryptedData.entry = entry
                decryptedProviderList.push(decryptedData)
            } catch(e) {
                invalidEntries.push({
                    entry: entry,
                    error: e.toString(),
                })
            }
        }
        return { data: decryptedProviderList, invalidEntries: invalidEntries, status: 'loaded' };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

// return the provider data key pair
export async function providerDataKeyPair(state, keyStore, settings, data){
    if (settings.get("test")){
        // in the test mode the key is stored in the backend
        const backend = settings.get("backend")
        return {
            status: "loaded",
            data: backend.appointments.providerDataEncryptionKeyPair,
        }
    }
    return {
        status: "failed",
    }
}

// make sure the signing and encryption key pairs exist
export async function keyPairs(state, keyStore, settings) {
    const backend = settings.get('backend');

    let providerKeyPairs = backend.local.get('mediator::keyPairs');

    if (state !== undefined){
        if (state.status === "loading")
            return state
        if (state.status === "loaded")
            keyStore.set({status: "updating", data: state.data})
    } else {
        keyStore.set({status: "loading"})        
    }

    if (providerKeyPairs === null) {
        const encryptionKeyPair = await generateECDSAKeyPair();
        const signingKeyPair = await generateECDHKeyPair();
        let providerKeyPairs = {
            signing: signingKeyPair,
            encryption: encryptionKeyPair,
        };
        backend.local.set('mediator::keyPairs', providerKeyPairs);
    }

    // in the test environment we automatically add the mediator keys to
    // the public key list and sign them with the root key so that they're
    // accepted as valid keys...
    if (settings.get('test')) {
        await e(backend.appointments.addMediatorPublicKeys(providerKeyPairs));
    }

    return {status: "loaded", data: providerKeyPairs};
}

// make sure the keys are registered in the backend
export async function validKeyPairs(state, keyStore, settings, key) {
    return { valid: true };
}

