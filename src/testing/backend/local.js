// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// The local backend
export default class LocalBackend {
    constructor(settings, store) {
        this.settings = settings;
        this.store = store;
    }

    get(key, defaultValue) {
        return this.store.get(key, defaultValue);
    }

    set(key, data) {
        return this.store.set(key, data);
    }

    delete(key) {
        return this.store.delete(key);
    }

    deleteAll(prefix) {
        return this.store.deleteAll(prefix);
    }
}
