// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import AppointmentsBackend from './appointments';
import { PrefixStore } from './store';
import StorageBackend from './storage';
import LocalBackend from './local';

export * from './store';

export default class Backend {
    constructor(settings, store, temporaryStore) {
        this.settings = settings;
        this.storage = new StorageBackend(settings);
        this.appointments = new AppointmentsBackend(settings);
        this.local = new LocalBackend(settings, new PrefixStore(store, 'local'));
        this.temporary = new LocalBackend(settings, new PrefixStore(temporaryStore, 'temporary'));
    }
}
