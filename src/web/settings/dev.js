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

import baseSettings from './base';
import genericSettings from 'settings/dev';
import userSettings from 'apps/user/settings/dev';
import providerSettings from 'apps/provider/settings/dev';
import mediatorSettings from 'apps/mediator/settings/dev';
import authSettings from 'apps/auth/settings/dev';

const settings = new Settings();

settings.update(genericSettings);
settings.update(baseSettings);
settings.update(userSettings);
settings.update(providerSettings);
settings.update(mediatorSettings);
settings.update(authSettings);

export default settings;
