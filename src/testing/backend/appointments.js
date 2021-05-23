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
    hash,
    sign,
    verify,
    deriveToken,
    generateECDSAKeyPair,
    ephemeralECDHEncrypt,
    ephemeralECDHDecrypt,
    generateECDHKeyPair,
    randomBytes,
} from 'helpers/crypto';
import { e } from 'helpers/async';

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// The appointments backend
export default class AppointmentsBackend {
    constructor(settings, store) {
        this._initialized = false;
        this.settings = settings;
        this.store = store;
        this.initialize();
    }

    async priorityToken(queue, n) {
        return await e(deriveToken(queue.id, this.secret, n));
    }

    async initialized() {
        let i = 0;
        while (!this._initialized) {
            await e(timeout(10));
            if (i++ > 100) {
                throw 'still not initialized';
            }
        }
    }

    async confirmProvider({ id, key, providerData, keyData }) {
        let found = false;
        for (const existingKey of this.keys.providers) {
            if (existingKey.data === keyData.data) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.keys.providers.push(keyData);
            this.store.set('keys', this.keys);
        }
        // we store the verified provider data
        const result = await e(this.storeData(id, providerData));
        if (!result) return;
        return {};
    }

    // add the mediator key to the list of keys (only for testing)
    async addMediatorPublicKeys(keys) {
        await e(this.initialized());
        const keyData = {
            encryption: keys.encryption.publicKey,
            signing: keys.signing.publicKey,
        };
        const jsonData = JSON.stringify(keyData);
        const signedData = await e(
            sign(this.rootSigningKeyPair.privateKey, jsonData)
        );
        for (const data of this.keys.mediators) {
            if (data.data == signedData.data) {
                return;
            }
        }
        // we add the signed mediator key
        this.keys.mediators.push(signedData);
        this.store.set('keys', this.keys);
    }

    // returns the public root signing key (required to e.g. verify mediator keys)
    get rootSigningPublicKey() {
        return this.rootSigningKeyPair.publicKey;
    }

    // initializes the appointments testing backend
    async initialize() {
        // we generate a root signing key pair that will sign e.g. mediator keys
        let rootSigningKeyPair = this.store.get('rootSigningKeyPair');
        if (rootSigningKeyPair === null) {
            rootSigningKeyPair = await e(generateECDSAKeyPair());
            this.store.set('rootSigningKeyPair', rootSigningKeyPair);
        }

        this.rootSigningKeyPair = rootSigningKeyPair;

        // the key pair for encrypting list keys
        let listKeysEncryptionKeyPair = this.store.get(
            'listKeysEncryptionKeyPair'
        );

        if (listKeysEncryptionKeyPair === null) {
            listKeysEncryptionKeyPair = await e(generateECDHKeyPair());
            this.store.set(
                'listKeysEncryptionKeyPair',
                listKeysEncryptionKeyPair
            );
        }

        this.listKeysEncryptionKeyPair = listKeysEncryptionKeyPair;

        // the key pair for encrypting queue data
        let queueEncryptionKeyPair = this.store.get('queueEncryptionKeyPair');

        if (queueEncryptionKeyPair === null) {
            queueEncryptionKeyPair = await e(generateECDHKeyPair());
            this.store.set('queueEncryptionKeyPair', queueEncryptionKeyPair);
        }

        this.queueEncryptionKeyPair = queueEncryptionKeyPair;

        // the key pair for encrypting provider data
        let providerDataEncryptionKeyPair = this.store.get(
            'providerDataEncryptionKeyPair'
        );

        if (providerDataEncryptionKeyPair === null) {
            providerDataEncryptionKeyPair = await e(generateECDHKeyPair());
            this.store.set(
                'providerDataEncryptionKeyPair',
                providerDataEncryptionKeyPair
            );
        }

        this.providerDataEncryptionKeyPair = providerDataEncryptionKeyPair;

        // we generate a secret that will be used to generate priority tokens
        let secret = this.store.get('secret');
        if (secret === null) {
            secret = randomBytes(32);
            this.store.set('secret', secret);
        }

        this.secret = secret;

        const fixtures = this.settings.get('fixtures');
        let keys = this.store.get('keys');

        if (keys === null) {
            keys = {
                mediators: [],
                notifiers: [],
                providers: [],
            };
            this.store.set('keys', keys);
        }

        this.keys = keys;

        let queues = this.store.get('queues');

        if (queues === null) {
            const queuesFixtures = fixtures.get('queues');

            queues = [];
            for (let queue of queuesFixtures) {
                // we make a copy...
                queue = Object.assign({}, queue);
                // we generate an ID for each queue
                queue.id = randomBytes(32);
                // we generate a key for each queue
                queue.keyPair = await e(generateECDHKeyPair());
                // we encrypt the queue key with the queue encryption key pair
                // to which all mediators have access...
                [queue.encryptedPrivateKey, _] = await e(
                    ephemeralECDHEncrypt(
                        queue.keyPair.privateKey,
                        queueEncryptionKeyPair.publicKey
                    )
                );
                const decrypted = await e(
                    ephemeralECDHDecrypt(
                        queue.encryptedPrivateKey,
                        queueEncryptionKeyPair.privateKey
                    )
                );

                // we make sure the encryption & decryption works
                if (decrypted !== queue.keyPair.privateKey) throw 'uh oh';

                queues.push(queue);
            }
            this.store.set('queues', queues);
        }

        this.queues = queues;

        // and we're done!
        this._initialized = true;
    }

    // public endpoints

    async getQueues() {
        await e(this.initialized());
        return this.queues.map(queue => ({
            name: queue.name,
            type: queue.type,
            id: queue.id,
            publicKey: queue.keyPair.publicKey,
        }));
    }

    // return all public keys present in the system
    async getKeys() {
        await e(this.initialized());
        return {
            // keys of providers and mediators
            lists: this.keys,
            // key to encrypt provider data for verification
            providerData: this.providerDataEncryptionKeyPair.publicKey,
            // root signing key (also provided via app)
            rootKey: this.rootSigningKeyPair.publicKey,
        };
    }

    // user endpoints

    // get a token for a given queue
    getToken(hash, encryptedData, queueID) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // retract a token from a given queue
    retractToken(token) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // provider and user endpoints

    // get (encrypted) messages stored under a given ID
    getMessages(id) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // delete messages stored under a given ID
    deleteMessages(id) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // post a message to a given ID
    postMessage(id, encryptedData) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // provider-only endpoints

    async storeProviderData(id, signedData, code) {
        const result = await this.storeData(id, signedData);
        if (!result) return;
        let providerDataList = this.store.get('providers::list');
        if (providerDataList === null) providerDataList = [];
        for (const pid of providerDataList) {
            if (id === pid) return;
        }
        providerDataList.push(id);
        // we update the provider data list
        this.store.set('providers::list', providerDataList);
    }

    async getData(id) {
        // to do: implement access control (not really relevant though for the demo)
        return this.store.get(`data::${id}`);
    }

    // store provider data for verification
    async storeData(id, signedData) {
        const existingData = this.store.get(`data::${id}`);
        if (existingData !== null) {
            // there is already data under this entry, we verify the public key
            // of the stored data against the new data. If the key doesn't
            // verif the new data we don't update it...
            if (!(await e(verify([existingData.publicKey], signedData)))) {
                throw 'cannot update';
            }
        }
        this.store.set(`data::${id}`, signedData);
        return true;
    }

    // delete provider data stored for verification
    deleteProviderData(id) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // mark a given token as used using its secret
    markTokenAsUsed(token, secret) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // mediator-only endpoint

    async getPendingProviderData(keyPairs, limit) {
        const providersList = this.store.get('providers::list');
        if (providersList === null) return [];
        const providers = [];
        for (const providerID of providersList) {
            const providerData = this.store.get(`data::${providerID}`);
            if (providerData === null) return [];
            providers.push(providerData);
        }
        return providers;
    }

    // store the verified provider data in the system
    storeVerifiedProviderData(id, signedProviderData) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // delete the verified provider data from the system
    deleteVerifiedProviderData(id) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // store the signed queue data in the system
    storeQueueData(signedQueueData) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // delete queue data from the system
    deleteQueueData(id) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // simulates the background tasks that the normal operator backend would do
    backgroundTasks() {}
}
