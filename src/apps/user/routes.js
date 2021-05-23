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

import Setup from './setup';
import Start from './start';
import t from './translations.yml';

const routes = new Map([
    [
        'index',
        {
            url: '/user/?',
            handler: () => ({
                t: t,
                title: 'welcome',
                component: Start,
                isSimple: true,
                props: {},
            }),
        },
    ],
    [
        'setup',
        {
            url: '/user/setup(?:/([a-z-]+))?(?:/([a-z-]+))?',
            handler: (page, status) => ({
                t: t,
                title: 'setup',
                isSimple: true,
                component: Setup,
                props: {
                    page: page,
                    status: status,
                },
            }),
        },
    ],
]);

export default routes;
