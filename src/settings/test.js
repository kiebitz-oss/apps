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

import Settings from 'helpers/settings';
import Fixtures from 'testing/fixtures';
import Backend, {LocalStorageStore} from 'testing/backend';
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
const backend = new Backend(settings, new LocalStorageStore())

settings.set('backend', backend)

export default settings;
