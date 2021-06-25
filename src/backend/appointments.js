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

import JSONRPCBackend from './jsonrpc';

// The appointments backend
export default class AppointmentsBackend extends JSONRPCBackend {
    constructor(settings) {
        super(settings, 'appointmentsApi');
        this.settings = settings;
    }

    async confirmProvider(
        { id, verifiedID, key, encryptedProviderData, signedKeyData },
        keyPair
    ) {
        return await this.call(
            'confirmProvider',
            { id, verifiedID, key, encryptedProviderData, signedKeyData },
            keyPair
        );
    }

    // add the mediator key to the list of keys (only for testing)
    async addMediatorPublicKeys({ keys }, keyPair) {
        return await this.call('addMediatorPublicKeys', { keys }, keyPair);
    }

    // public endpoints

    async getQueues({ zipCode, radius }) {
        return await this.call('getQueues', { zipCode, radius });
    }

    // return all public keys present in the system
    async getKeys() {
        return await this.call('getKeys', {});
    }

    // data endpoints

    async deleteData({ id }, keyPair) {
        return await this.call('deleteData', { id }, keyPair);
    }

    async getData({ id }, keyPair) {
        return await this.call('getData', { id }, keyPair);
    }

    async bulkGetData({ ids }, keyPair) {
        return await this.call('bulkGetData', { ids }, keyPair);
    }

    async bulkStoreData({ dataList }, keyPair) {
        return await this.call('bulkStoreData', { dataList }, keyPair);
    }

    // store provider data for verification
    async storeData({ id, data, permissions, grant }, keyPair) {
        return await this.call(
            'storeData',
            { id, data, permissions, grant },
            keyPair
        );
    }

    // user endpoints

    // get a token for a given queue
    async getToken({
        hash,
        encryptedData,
        queueID,
        code,
        queueData,
        signedTokenData,
    }) {
        return await this.call('getToken', {
            hash: hash,
            code: code,
            encryptedData: encryptedData,
            queueID: queueID,
            queueData: queueData,
            signedTokenData: signedTokenData,
        });
    }

    // provider-only endpoints

    // get n tokens from the given queue IDs
    async returnTokens({ tokens }, keyPair) {
        return await this.call('returnTokens', { tokens }, keyPair);
    }

    // get n tokens from the given queue IDs
    async getQueueTokens({ expiration, capacities }, keyPair) {
        return await this.call(
            'getQueueTokens',
            { capacities, expiration },
            keyPair
        );
    }

    async storeProviderData({ id, encryptedData, code }, keyPair) {
        return await this.call(
            'storeProviderData',
            { id, encryptedData, code },
            keyPair
        );
    }

    // mark tokens as used
    async markTokensAsUsed({ tokens }, keyPair) {
        return await this.call('markTokenAsUsed', { tokens }, keyPair);
    }

    // mediator-only endpoint

    async getQueuesForProvider({ queueIDs }, keyPair) {
        return await this.call('getQueuesForProvider', { queueIDs }, keyPair);
    }

    async getPendingProviderData({ limit }, keyPair) {
        return await this.call('getPendingProviderData', { limit }, keyPair);
    }

    async getVerifiedProviderData({ limit }, keyPair) {
        return await this.call('getVerifiedProviderData', { limit }, keyPair);
    }
}
