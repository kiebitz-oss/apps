// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Setup from './setup';
import Start from './start';
import Dashboard from './dashboard';
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
        'userDashboard',
        {
            url: '/user/(appointments|settings)',
            handler: tab => ({
                t: t,
                title: 'dashboard',
                component: Dashboard,
                props: { tab: tab },
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
