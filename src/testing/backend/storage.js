// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// The storage backend
export default class StorageBackend {
    constructor(settings, store) {
        this.settings = settings;
        this.store = store;
    }

    storeSettings(id, data) {
        return new Promise((resolve, reject) => {
            this.store.set(`settings:${id}`, data);
            resolve();
        });
    }

    getSettings(id) {
        return new Promise((resolve, reject) => {
            resolve(this.store.get(`settings:${id}`));
        });
    }
}
