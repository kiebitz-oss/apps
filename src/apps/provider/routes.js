// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Dashboard from './dashboard';
import Setup from './setup';
import t from './translations.yml';

const routes = new Map([
    [
        'providerDashboard',
        {
            url:
                '/provider(?:/(schedule|settings)(?:/([a-z-]+))?(?:/([a-z0-9]+))?)?',
            handler: (tab, action, id) => ({
                t: t,
                title: 'dashboard',
                component: Dashboard,
                isSimple: true,
                authentication: 'provider',
                props: { tab: tab || 'schedule', action: action, id: id },
            }),
        },
    ],
    [
        'providerSetup',
        {
            url: '/provider/setup(?:/([a-z-]+))?(?:/([a-z-]+))?',
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
