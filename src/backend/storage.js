// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import JSONRPCBackend from './jsonrpc';

// The storage backend
export default class StorageBackend extends JSONRPCBackend {
    constructor(settings) {
        super(settings, 'storageApi');
        this.settings = settings;
    }

    async storeSettings({ id, data }) {
        return await this.call('storeSettings', { id, data });
    }

    async getSettings({ id }) {
        return await this.call('getSettings', { id });
    }
}
