// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import AppointmentsBackend from './appointments';
import StorageBackend from './storage';
import { PrefixStore } from 'backend/store';
import LocalBackend from 'backend/local';

export default class Backend {
    constructor(settings, store, temporaryStore) {
        this.settings = settings;
        this.storage = new StorageBackend(settings, new PrefixStore(store, 'storage'));
        this.appointments = new AppointmentsBackend(settings, new PrefixStore(store, 'appts'));

        this.local = new LocalBackend(settings, new PrefixStore(store, 'local'));
        this.temporary = new LocalBackend(settings, new PrefixStore(temporaryStore, 'temporary'));
    }
}
