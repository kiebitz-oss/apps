// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { e } from "helpers/async";
import {
    verify,
    sign,
    hash,
    generateECDSAKeyPair,
    generateECDHKeyPair,
    ephemeralECDHEncrypt,
    ecdhDecrypt
} from 'helpers/crypto';

export async function confirmProvider(state, keyStore, settings, providerData, keyPairs, queueKeyPair){

    console.log(queueKeyPair)

    // we only store hashes of the public key values, as the actual keys are
    // always passed to the user, so they never need to be looked up...
    const keyHashesData = {
        signing: await e(hash(providerData.publicKeys.signing)),
        encryption: await e(hash(providerData.publicKeys.encryption)),
        queues: providerData.data.queues,
    }

    const keysJSONData = JSON.stringify(keyHashesData)
    const providerJSONData = JSON.stringify(providerData.data)

    // we hash the public key value
    const publicKeyHash = await e(hash(keyPairs.signing.publicKey))

    // this will be published, so we only store the hashed key
    const signedKeyData = await e(
        sign(keyPairs.signing.privateKey, keysJSONData, publicKeyHash)
    );


    const backend = settings.get('backend')

    const queues = await e(backend.appointments.getQueuesForProvider(providerData.data.queues))

    const queuePrivateKeys = []
    for(const queue of queues){
        const queuePrivateKey = await e(ecdhDecrypt(queue.encryptedPrivateKey, queueKeyPair.privateKey))
        queuePrivateKeys.push({
            privateKey: queuePrivateKey,
            id: queue.id,
        })
    }

    // this will be stored for the provider, so we add the public key data
    const signedProviderData = await e(
        sign(keyPairs.signing.privateKey, providerJSONData, keyPairs.signing.publicKey)
    );

    const fullData = {
        queuePrivateKeys: queuePrivateKeys,
        signedData: signedProviderData    
    }

    const entryData = JSON.parse(providerData.entry.data)
    const signedJSONData = JSON.stringify(fullData)

    // we encrypt the data with the public key supplied by the provider
    const [encryptedData, _] = await e(
        ephemeralECDHEncrypt(signedJSONData, entryData.publicKey)
    );

    // this will be stored for the provider, so we add the public key data
    const signedEncryptedData = await e(
        sign(keyPairs.signing.privateKey, encryptedData, keyPairs.signing.publicKey)
    );

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
    if (state !== undefined){
        if (state.status === "loading")
            return
        if (state.status === "loaded")
            keyStore.set({ status: 'updating' });
    } else
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
                const decryptedJSONData = await e(ecdhDecrypt(encryptedData, dataKeyPair.privateKey))
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

// return the provider list key pair
export async function queueKeyPair(state, keyStore, settings, data){
    if (settings.get("test")){
        // in the test mode the key is stored in the backend
        const backend = settings.get("backend")
        return {
            status: "loaded",
            data: backend.appointments.queueKeyEncryptionKeyPair,
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

