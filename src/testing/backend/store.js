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

    get(key) {
        return this.store.get(`${this.prefix}::${key}`);
    }

    remove(key) {
        return this.store.remove(`${this.prefix}::${key}`);
    }
}

export class StorageStore {
    constructor(storage) {
        this.storage = storage;
    }

    set(key, data) {
        this.storage.setItem(key, JSON.stringify(data));
    }

    get(key) {
        const data = this.storage.getItem(key);
        if (data !== null) return JSON.parse(data);
        return data;
    }

    remove(key) {
        this.storage.removeItem(key);
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
