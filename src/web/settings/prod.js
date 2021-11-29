// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Settings from 'helpers/settings';

import baseSettings from './base';
import genericSettings from 'settings/prod';
// import userSettings from 'apps/user/settings/prod';
// import providerSettings from 'apps/provider/settings/prod';
// import mediatorSettings from 'apps/mediator/settings/prod';
// import authSettings from 'apps/auth/settings/prod';

const settings = new Settings();

settings.update(genericSettings);
settings.update(baseSettings);
// settings.update(userSettings);
// settings.update(providerSettings);
// settings.update(mediatorSettings);
// settings.update(authSettings);

export default settings;
