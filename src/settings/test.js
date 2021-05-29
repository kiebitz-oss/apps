// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Settings from 'helpers/settings';
import Fixtures from 'testing/fixtures';
import Backend, {
    LocalStorageStore,
    SessionStorageStore,
} from 'testing/backend';
import baseSettings from './base';

const settings = new Settings();

settings.update(baseSettings);

settings.update(
    new Settings([
        ['externalSettingsPath', '/settings_test.json'],
        ['fixtures', Fixtures],
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
