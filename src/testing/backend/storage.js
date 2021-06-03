// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// The storage backend
export default class StorageBackend {
    constructor(settings, store) {
        this.settings = settings;
        this.store = store;
    }

    async storeSettings({ id, data }) {
        return this.store.set(`settings:${id}`, data);
    }

    async getSettings({ id }) {
        return this.store.get(`settings:${id}`);
    }
}
