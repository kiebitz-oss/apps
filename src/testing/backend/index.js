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

import AppointmentsBackend from './appointments';
import { PrefixStore } from './store';
import StorageBackend from './storage';
import LocalBackend from './local';

export * from './store';

export default class Backend {
    constructor(settings, store) {
        this.settings = settings;
        this.storage = new StorageBackend(
            settings,
            new PrefixStore(store, 'storage')
        );
        this.appointments = new AppointmentsBackend(
            settings,
            new PrefixStore(store, 'appts')
        );
        this.local = new LocalBackend(
            settings,
            new PrefixStore(store, 'local')
        );
    }
}
