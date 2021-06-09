// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import settings, { Settings } from 'helpers/settings';

import routes from '../routes';
import menu from '../menu';

settings.update(
    new Settings([
        ['routes', routes],
        ['menu', menu],
    ])
);

export default settings;
