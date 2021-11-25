// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

/* global COMMIT_SHA */
//our own styles

import Settings from 'helpers/settings';
import logo from 'assets/images/logo-gesundheitsamt-horizontal.svg';
import secondaryLogo from 'assets/images/logo-ffm.svg';
import routes from 'routes';
import properties from './properties.yml';

const settings = new Settings([
    ['appointmentProperties', properties],
    ['title', 'Kiebitz'],
    ['logo', logo],
    ['secondaryLogo', secondaryLogo],
    ['apps', new Map([])],
    ['menu', new Map([])],
    ['routes', routes],
    ['lang', 'de'],
    ['showTitles', true],
    ['commitSHA', COMMIT_SHA],
]);

export default settings;
