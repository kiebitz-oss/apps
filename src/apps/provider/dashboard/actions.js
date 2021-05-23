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

import {
    sign,
    hash,
    randomBytes,
    generateECDSAKeyPair,
    ephemeralECDHEncrypt,
    ephemeralECDHDecrypt,
    generateECDHKeyPair,
} from 'helpers/crypto';
import { e } from 'helpers/async';

// make sure the signing and encryption key pairs exist
export async function keyPairs(state, keyStore, settings) {
    const backend = settings.get('backend');

    const providerKeyPairs = backend.local.get('provider::keyPairs');

    keyStore.set({ status: 'loading' });

    if (providerKeyPairs === null) {
        try {
            const encryptionKeyPair = await e(generateECDSAKeyPair());
            const signingKeyPair = await e(generateECDHKeyPair());
            const keyPairs = {
                signing: signingKeyPair,
                encryption: encryptionKeyPair,
            };
            backend.local.set('provider::keyPairs', keyPairs);
            return {
                status: 'loaded',
                data: keyPairs,
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e.toString(),
            };
        }
    } else {
        return {
            status: 'loaded',
            data: providerKeyPairs,
        };
    }
}

export async function keys(state, keyStore, settings) {
    const backend = settings.get('backend');
    keyStore.set({ status: 'loading' });
    try {
        const keys = await e(backend.appointments.getKeys());
        return {
            status: 'loaded',
            data: keys,
        };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

// generate and return the (local) provider data
export async function providerData(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    let providerData = backend.local.get('provider::data');
    if (providerData === null) {
        providerData = {
            id: randomBytes(32),
            verifiedID: randomBytes(32),
            data: {},
        };
    }
    if (data !== undefined) providerData.data = data;
    backend.local.set('provider::data', providerData);
    return {
        status: 'loaded',
        data: providerData,
    };
}

// make sure the keys are registered in the backend
export async function validKeyPairs(state, keyStore, settings, keyPairs, keys) {
    const signingKeyHash = await e(hash(keyPairs.signing.publicKey));
    const encryptionKeyHash = await e(hash(keyPairs.encryption.publicKey));
    let found = false;
    for (const providerKeys of keys.lists.providers) {
        // to do: check signature!
        const keyData = JSON.parse(providerKeys.data);
        if (
            keyData.signing == signingKeyHash &&
            keyData.encryption == encryptionKeyHash
        ) {
            found = true;
            break;
        }
    }
    return { valid: found };
}

export async function queues(state, keyStore, settings) {
    const backend = settings.get('backend');
    keyStore.set({ status: 'loading' });
    try {
        const queues = await e(backend.appointments.getQueues());
        return { status: 'loaded', data: queues };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

export async function checkVerifiedProviderData(
    state,
    keyStore,
    settings,
    data
) {
    const backend = settings.get('backend');
    const verifiedData = await e(backend.appointments.getData(data.verifiedID));
    if (verifiedData === null) return { status: 'not-found' };
    const encryptionKey = backend.local.get('provider::data::encryptionKey');
    try {
        const decryptedJSONData = await e(
            ephemeralECDHDecrypt(verifiedData.data, encryptionKey)
        );
        const decryptedData = JSON.parse(decryptedJSONData);
        decryptedData.signedData.json = decryptedData.signedData.data;
        decryptedData.signedData.data = JSON.parse(
            decryptedData.signedData.data
        );
        backend.local.set('provider::data::verified', decryptedData);
        return { status: 'loaded', data: decryptedData };
    } catch (e) {
        return { status: 'failed' };
    }
}

// store the provider data for validation in the backend
export async function submitProviderData(
    state,
    keyStore,
    settings,
    data,
    keyPairs,
    keys
) {
    const backend = settings.get('backend');
    const dataToEncrypt = Object.assign({}, data);
    dataToEncrypt.publicKeys = {
        signing: keyPairs.signing.publicKey,
        encryption: keyPairs.encryption.publicKey,
    };

    const providerDataKey = keys.providerData;

    // we convert the data to JSON
    const jsonData = JSON.stringify(dataToEncrypt);
    const [encryptedData, privateKey] = await e(
        ephemeralECDHEncrypt(jsonData, providerDataKey)
    );

    const encryptedJSONData = JSON.stringify(encryptedData);

    // we store the provider data key so we can decrypt the data later
    backend.local.set('provider::data::encryptionKey', privateKey);

    const signedData = await e(
        sign(
            keyPairs.signing.privateKey,
            encryptedJSONData,
            keyPairs.signing.publicKey
        )
    );

    try {
        return await e(
            backend.appointments.storeProviderData(data.id, signedData)
        );
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}
