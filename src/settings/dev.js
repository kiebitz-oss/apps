// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Settings from 'helpers/settings';
import baseSettings from './base';
import Backend, { LocalStorageStore, SessionStorageStore } from 'backend';

const settings = new Settings();
settings.update(baseSettings);
settings.updateWithMap(
    new Map([
        ['storageApi', 'http://localhost:9999/jsonrpc'],
        ['appointmentsApi', 'http://localhost:8888/jsonrpc'],
    ])
);

// by default we use the local testing backend (will be overwritten in the
// production or development settings)
const backend = new Backend(
    settings,
    new LocalStorageStore(),
    new SessionStorageStore()
);

settings.set('backend', backend);

export default settings;
