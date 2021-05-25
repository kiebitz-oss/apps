// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Dashboard from './dashboard';
import t from './translations.yml';

const routes = new Map([
    [
        'providerDashboard',
        {
            url:
                '/provider(?:/(schedule|settings))?(?:/([a-z-]+))?(?:/([a-z0-9]+))?',
            handler: (tab, action, id) => ({
                t: t,
                title: 'dashboard',
                component: Dashboard,
                authentication: 'provider',
                props: { tab: tab || 'schedule', action: action, id: id },
            }),
        },
    ],
]);

export default routes;
