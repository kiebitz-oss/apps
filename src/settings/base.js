// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

/* global COMMIT_SHA */
//our own styles

import settings, { Settings } from 'helpers/settings';
import siLogo from 'assets/images/si-logo.png';
import routes from 'routes';
import properties from './properties.yml';

settings.update(
    new Settings([
        ['appointmentProperties', properties],
        ['title', 'Kiebitz'],
        ['logo', siLogo],
        ['whiteLogo', siLogo],
        ['smallWhiteLogo', siLogo],
        ['apps', new Map([])],
        ['menu', new Map([])],
        ['routes', routes],
        ['lang', 'de'],
        ['showTitles', true],
        ['commitSHA', COMMIT_SHA],
    ])
);

export default settings;
