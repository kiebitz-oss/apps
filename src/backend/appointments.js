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

// The appointments backend
export default class AppointmentsBackend {
    constructor(settings) {
        this.settings = settings;
    }

    async confirmProvider({ id, key, providerData, keyData }, keyPair) {}

    // add the mediator key to the list of keys (only for testing)
    async addMediatorPublicKeys({ keys }, keyPair) {}

    // public endpoints

    async getQueues({ zipCode, radius }) {}

    // return all public keys present in the system
    async getKeys() {}

    // data endpoints

    async deleteData({ id }, keyPair) {}

    async getData({ id }, keyPair) {}

    async bulkGetData({ ids }, keyPair) {}

    async bulkStoreData({ dataList }, keyPair) {}

    // store provider data for verification
    async storeData({ id, data, permissions, grant }, keyPair) {}

    // user endpoints

    // get a token for a given queue
    async getToken({
        hash,
        encryptedData,
        queueID,
        queueData,
        signedTokenData,
    }) {}

    // provider-only endpoints

    // get n tokens from the given queue IDs
    async getQueueTokens({ capacities }, keyPair) {}

    async storeProviderData({ id, encryptedData, code }, keyPair) {}

    // mark a given token as used using its secret
    async markTokenAsUsed({ token, secret }, keyPair) {}

    // mediator-only endpoint

    async getPendingProviderData({ limit }, keyPair) {}
}
