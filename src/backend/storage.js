// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import JSONRPCBackend from './jsonrpc';

// The storage backend
export default class StorageBackend extends JSONRPCBackend {
    constructor(settings) {
        super(settings, 'appointmentsApi');
        this.settings = settings;
    }

    storeSettings({ id, data }) {}

    getSettings({ id }) {}
}
