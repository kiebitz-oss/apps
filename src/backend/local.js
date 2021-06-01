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
        this._lock_requested = false;
    }

    get(key, defaultValue) {
        return this.store.get(key, defaultValue);
    }

    async unlock() {
        this._locked = false;
    }

    async lock() {
        let i = 0;
        if (this._lock_requested) return;
        this._lock_requested = true;
        while (this._locked) {
            await timeout(10);
            if (i++ > 100) {
                throw 'still locked';
            }
        }
        if (!this._lock_requested) throw 'race';
        this._lock_requested = false;
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
