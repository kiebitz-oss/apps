// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Settings from 'helpers/settings';
import baseSettings from './base';

const settings = new Settings();
settings.update(baseSettings);

export default settings;
