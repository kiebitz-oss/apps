// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/* global COMMIT_SHA */
//our own styles

import Settings from 'helpers/settings';
import logo from 'assets/images/logo.png';
import smallLogo from 'assets/images/logo-small.png';
import whiteLogo from 'assets/images/logo-white.png';
import smallWhiteLogo from 'assets/images/logo-small-white.png';
import routes from 'routes';

const settings = new Settings([
    ['title', 'Kiebitz'],
    ['logo', logo],
    ['whiteLogo', whiteLogo],
    ['smallWhiteLogo', smallWhiteLogo],
    ['apps', new Map([])],
    ['menu', new Map([])],
    ['routes', routes],
    ['lang', 'de'],
    ['showTitles', true],
    ['commitSHA', COMMIT_SHA],
]);

export default settings;
