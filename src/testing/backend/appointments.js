// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    hash,
    sign,
    verify,
    deriveToken,
    generateECDSAKeyPair,
    ephemeralECDHEncrypt,
    ecdhDecrypt,
    generateECDHKeyPair,
    randomBytes,
} from 'helpers/crypto';
import { copy } from 'helpers/store';
import { shuffle } from 'helpers/lists';
import { e } from 'helpers/async';

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// The appointments backend
class AppointmentsBackend {
    constructor(settings, store) {
        console.log(settings, store);
        this._initialized = false;
        this.settings = settings;
        this.store = store;
        this.initialize();
    }

    async _priorityToken() {
        this.store.set('position', ++this.position);
        return await deriveToken(this.secret, this.position);
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

    async confirmProvider({ verifiedID, id, encryptedProviderData, signedKeyData }, keyPair) {
        let found = false;
        const keyDataJSON = JSON.parse(signedKeyData.data);
        const newProviders = [];
        for (const existingKey of this.keys.providers) {
            const existingKeyDataJSON = JSON.parse(existingKey.data);
            if (existingKeyDataJSON.signing === keyDataJSON.signing) {
                found = true;
                newProviders.push(signedKeyData);
            } else {
                newProviders.push(existingKey);
            }
        }
        if (!found) newProviders.push(signedKeyData);
        this.keys.providers = newProviders;
        this.store.set('keys', this.keys);
        // we store the verified provider data
        const result = await this.storeData(
            { id: verifiedID, data: encryptedProviderData },
            keyPair
        );

        if (!result) return;

        // we remove the provider from the list of unverified providers
        let oldProviderData;
        const providersList = this.store.get('providers::list', []);
        const providers = [];
        for (const providerID of providersList) {
            const providerData = this.store.get(`data::${providerID}`);
            if (providerData === null) continue;
            if (providerData.id === id) {
                oldProviderData = providerData;
                continue;
            }
            providers.push(providerData);
        }

        this.store.set('providers::list', providers);

        // we add the provider to the list of verified providers
        const verifiedProvidersList = this.store.get('providers::list::verified', []);
        verifiedProvidersList.push(oldProviderData);
        this.store.set('providers::list::verified', verifiedProvidersList);

        return {};
    }

    // add the mediator key to the list of keys (only for testing)
    async addMediatorPublicKeys({ keys }, keyPair) {
        await e(this.initialized());
        const keyData = {
            encryption: keys.encryption.publicKey,
            signing: keys.signing.publicKey,
        };
        const jsonData = JSON.stringify(keyData);
        const signedData = await e(sign(this.rootSigningKeyPair.privateKey, jsonData));
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

        let position = this.store.get('position');

        if (position === null) {
            position = 0;
            this.store.set('position', position);
        }

        this.position = position;

        this.rootSigningKeyPair = rootSigningKeyPair;

        let tokens = this.store.get('tokens');
        if (tokens === null) {
            tokens = {};
            this.store.set('tokens', tokens);
        }
        this.tokens = tokens;

        // the key pair for encrypting queue data
        let queueKeyEncryptionKeyPair = this.store.get('queueKeyEncryptionKeyPair');

        if (queueKeyEncryptionKeyPair === null) {
            queueKeyEncryptionKeyPair = await e(generateECDHKeyPair());
            this.store.set('queueKeyEncryptionKeyPair', queueKeyEncryptionKeyPair);
        }

        this.queueKeyEncryptionKeyPair = queueKeyEncryptionKeyPair;

        // the key pair for encrypting queue data
        let tokenSigningKeyPair = this.store.get('tokenSigningKeyPair');

        if (tokenSigningKeyPair === null) {
            tokenSigningKeyPair = await e(generateECDSAKeyPair());
            this.store.set('tokenSigningKeyPair', tokenSigningKeyPair);
        }

        this.tokenSigningKeyPair = tokenSigningKeyPair;

        // the key pair for encrypting provider data
        let providerDataEncryptionKeyPair = this.store.get('providerDataEncryptionKeyPair');

        if (providerDataEncryptionKeyPair === null) {
            providerDataEncryptionKeyPair = await e(generateECDHKeyPair());
            this.store.set('providerDataEncryptionKeyPair', providerDataEncryptionKeyPair);
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
                [queue.encryptedPrivateKey] = await e(
                    ephemeralECDHEncrypt(JSON.stringify(queue.keyPair.privateKey), queueKeyEncryptionKeyPair.publicKey)
                );

                queues.push(queue);
            }
            this.store.set('queues', queues);
        }

        this.queues = queues;

        // and we're done!
        this._initialized = true;
    }

    // public endpoints

    async getQueues({ zipCode, radius }) {
        await e(this.initialized());
        // we just look at nearest neighbors here...
        return this.queues
            .filter((q) => q.zipCode === zipCode.slice(0, 2))
            .map((queue) => ({
                name: queue.name,
                type: queue.type,
                id: queue.id,
                publicKey: queue.keyPair.publicKey,
            }));
    }

    // return all public keys present in the system
    async getKeys() {
        await this.initialized();
        this.keys = this.store.get('keys');
        const keys = copy({
            // keys of providers and mediators
            lists: this.keys,
            // key to encrypt provider data for verification
            providerData: this.providerDataEncryptionKeyPair.publicKey,
            // root signing key (also provided via app)
            rootKey: this.rootSigningKeyPair.publicKey,
            // the token signing key (used by providers to verify a token hash)
            tokenKey: this.tokenSigningKeyPair.publicKey,
        });

        return keys;
    }

    // data endpoints

    async deleteData({ id }, keyPair) {
        return this.store.remove(`data::${id}`);
    }

    async getData({ id }, keyPair) {
        // to do: implement access control (not really relevant though for the demo)
        const result = this.store.get(`data::${id}`);
        return result;
    }

    async bulkGetData({ ids }, keyPair) {
        const results = [];
        for (const id of ids) {
            results.push(await this.getData({ id }, keyPair));
        }
        return results;
    }

    async bulkStoreData({ dataList }, keyPair) {
        const results = [];
        for (const data of dataList) {
            try {
                const result = await e(
                    this.storeData(
                        {
                            id: data.id,
                            data: data.data,
                            permissions: data.permissions,
                            grant: data.grant,
                        },
                        keyPair
                    )
                );
                results.push(result);
            } catch (e) {
                results.push(null);
            }
        }
    }

    // store provider data for verification
    async storeData({ id, data, permissions, grant }, keyPair) {
        this.store.set(`data::${id}`, data);
        return true;
    }

    // user endpoints

    // get a token for a given queue
    async getToken({ hash, encryptedData, queueID, queueData, signedTokenData }) {
        let queueToken;
        if (signedTokenData !== undefined) {
            // to do: validate signature!
            let signedToken = JSON.parse(signedTokenData.data);
            if (!(await e(verify([this.tokenSigningKeyPair.publicKey], signedTokenData))))
                throw 'signature does not match';
            const newTokens = {};
            for (const [qID, tokens] of Object.entries(this.tokens)) {
                const newTokensList = [];
                for (const et of tokens) {
                    if (et.token == signedToken.token) {
                        queueToken = et;
                        // we update the queue data
                        queueToken.queueData = queueData;
                        continue;
                    }
                    newTokensList.push(et);
                }
                newTokens[qID] = newTokensList;
            }
            this.tokens = newTokens;
        }
        // seems we haven't found this token in any queue (or no existing token was given)...
        if (queueToken === undefined) {
            const token = await this._priorityToken();
            const tokenData = {
                token: token,
                hash: hash,
            };
            const tokenDataJSON = JSON.stringify(tokenData);
            signedTokenData = await sign(this.tokenSigningKeyPair.privateKey, tokenDataJSON);
            queueToken = {
                token: token,
                position: this.position,
                queueData: queueData,
                encryptedData: encryptedData,
            };
        }

        let queueTokens = this.tokens[queueID];

        if (queueTokens === undefined) {
            queueTokens = [];
            this.tokens[queueID] = queueTokens;
        }

        queueTokens.push(queueToken);
        this.store.set('tokens', this.tokens);

        return signedTokenData;
    }

    // provider-only endpoints

    _getProviderKeyData(publicKey) {
        for (const key of this.keys.providers) {
            const keyData = JSON.parse(key.data);
            if (keyData.signing === publicKey) {
                return keyData;
            }
        }
        return null;
    }

    _distance(zipCodeA, zipCodeB) {
        return 0.0;
    }

    async returnTokens({ tokens }, keyPair) {}

    // get n tokens from the given queue IDs
    async getQueueTokens({ expiration, capacities }, keyPair) {
        const providerKeyData = this._getProviderKeyData(keyPair.publicKey);

        if (providerKeyData === null) return null;

        // to do: verify signature against the official key
        // we update the tokens
        this.tokens = this.store.get('tokens', {});
        const queueIDs = providerKeyData.queues;
        const zipCode = providerKeyData.zipCode;
        const allTokens = [];
        const allTokensFlat = [];
        // we shuffle the queue IDs to avoid starvation of individual queues
        shuffle(queueIDs);
        // we also always remove just one token from every eligible list to
        // avoid starvation of individual lists of tokens...
        for (const capacity of capacities) {
            const tokens = [];
            const { n, properties } = capacity;
            tokenLoop: while (tokens.length < n) {
                let addedTokens = 0;
                queuesLoop: for (const queueID of queueIDs) {
                    let queueTokens = this.tokens[queueID];
                    // no tokens in this queue
                    if (queueTokens === undefined || queueTokens.length === 0) continue queuesLoop;
                    // we iterate through the tokens in the queue
                    candidates: for (let i = 0; i < queueTokens.length; i++) {
                        const token = queueTokens[i];
                        if (this._distance(token.queueData.zipCode, zipCode) > token.queueData.distance) {
                            continue candidates; // the distance between user and provider is too large
                        }
                        for (let [k, v] of Object.entries(properties)) {
                            if (token.queueData[k] !== undefined && token.queueData[k] !== v) continue candidates; // this token doesn't match the given properties
                        }
                        // we have found a suitable token
                        queueTokens = queueTokens.filter((t, j) => i !== j);
                        this.tokens[queueID] = queueTokens;
                        const tokenCopy = copy(token);
                        tokenCopy.queue = queueID;
                        tokens.push(tokenCopy);
                        addedTokens++;
                        break candidates;
                    }
                    // we've got enough tokens for this capacity specifier
                    if (tokens.length === n) break tokenLoop;
                }
                // there are no more eligible tokens
                if (addedTokens === 0) break tokenLoop;
            }
            allTokens.push(tokens);
            for (const token of tokens) allTokensFlat.push(token);
        }

        const selectedTokens = [...this.store.get('selectedTokens', []), ...allTokensFlat];

        // we persist the changes
        this.store.set('selectedTokens', selectedTokens);
        this.store.set('tokens', this.tokens);

        // no more tokens left
        return copy(allTokens);
    }

    async storeProviderData({ id, encryptedData, code }, keyPair) {
        const result = await this.storeData({ id: id, data: { encryptedData: encryptedData } }, keyPair);
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

    // mark a given token as used using its secret
    markTokensAsUsed({ tokens }, keyPair) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // mediator-only endpoint

    async getQueuesForProvider({ queueIDs }, keyPair) {
        queueIDs = new Set(queueIDs);
        await e(this.initialized());
        return this.queues
            .filter((queue) => queueIDs.has(queue.id))
            .map((queue) => ({
                name: queue.name,
                type: queue.type,
                id: queue.id,
                publicKey: queue.keyPair.publicKey,
                encryptedPrivateKey: queue.encryptedPrivateKey,
            }));
    }

    async getPendingProviderData({ limit }, keyPair) {
        const providersList = this.store.get('providers::list', []);
        const providers = [];
        for (const providerID of providersList) {
            const providerData = this.store.get(`data::${providerID}`);
            if (providerData === null) continue;
            providers.push(providerData);
        }
        return providers;
    }

    async getVerifiedProviderData({ limit }, keyPair) {
        const providersList = this.store.get('providers::list::verified', []);
        const providers = [];
        for (const providerID of providersList) {
            const providerData = this.store.get(`data::${providerID}`);
            if (providerData === null) continue;
            providers.push(providerData);
        }
        return providers;
    }

    // simulates the background tasks that the normal operator backend would do
    backgroundTasks() {}
}

export default AppointmentsBackend;
