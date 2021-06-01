// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Settings from 'helpers/settings';
import Fixtures from 'testing/fixtures';
import baseSettings from './base';

const settings = new Settings();

settings.update(baseSettings);

settings.update(
    new Settings([
        ['externalSettingsPath', '/settings_test.json'],
        ['fixtures', Fixtures],
    ])
);

export default settings;
