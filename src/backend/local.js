// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// The local backend
export default class LocalBackend {
    constructor(settings, store) {
        this.settings = settings;
        this.store = store;
        this._locked = false;
    }

    get(key, defaultValue) {
        return this.store.get(key, defaultValue);
    }

    unlock() {
        this._locked = false;
    }

    async lock() {
        let i = 0;
        while (this._locked) {
            await timeout(10);
            if (i++ > 100) {
                throw 'still locked';
            }
        }
        this._locked = true;
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
