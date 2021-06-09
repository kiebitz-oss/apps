// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import settings, { Settings } from 'helpers/settings';
import Fixtures from 'testing/fixtures';
import baseSettings from './base';

settings.update(baseSettings);

settings.update(
    new Settings([
        ['externalSettingsPath', '/settings_test.json'],
        ['fixtures', Fixtures],
    ])
);

export default settings;
