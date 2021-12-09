// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

/* global COMMIT_SHA */
//our own styles

import Settings from 'helpers/settings';
import logo from 'assets/images/logo.png';
import whiteLogo from 'assets/images/logo-white.png';
import smallWhiteLogo from 'assets/images/logo-small-white.png';
import properties from './properties.json';

const settings = new Settings([
    ['appointmentProperties', properties],
    ['title', 'Kiebitz'],
    ['logo', logo],
    ['whiteLogo', whiteLogo],
    ['smallWhiteLogo', smallWhiteLogo],
    ['lang', 'de'],
    ['showTitles', true],
    ['commitSHA', COMMIT_SHA],
]);

export default settings;
