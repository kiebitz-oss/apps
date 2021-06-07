// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export class PrefixStore {
    constructor(store, prefix) {
        this.store = store;
        this.prefix = prefix;
    }

    set(key, data) {
        return this.store.set(`${this.prefix}::${key}`, data);
    }

    get(key, defaultValue) {
        return this.store.get(`${this.prefix}::${key}`, defaultValue);
    }

    delete(key) {
        return this.store.delete(`${this.prefix}::${key}`);
    }

    deleteAll(prefix) {
        this.store.deleteAll(`${this.prefix}::${prefix}`);
    }
}

export class StorageStore {
    constructor(storage) {
        this.storage = storage;
    }

    set(key, data) {
        if (data === null || data === undefined) return this.delete(key);
        this.storage.setItem(key, JSON.stringify(data));
    }

    get(key, defaultValue) {
        const data = this.storage.getItem(key);
        if (data !== null) return JSON.parse(data);
        if (defaultValue !== undefined) return defaultValue;
        return null;
    }

    delete(key) {
        this.storage.removeItem(key);
    }

    deleteAll(prefix) {
        for (const key in this.storage) {
            if (key.startsWith(prefix)) this.storage.removeItem(key);
        }
    }
}

export class LocalStorageStore extends StorageStore {
    constructor() {
        super(localStorage);
    }
}

export class SessionStorageStore extends StorageStore {
    constructor() {
        super(sessionStorage);
    }
}
