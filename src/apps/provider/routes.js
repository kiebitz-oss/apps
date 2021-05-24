// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Dashboard from './dashboard';
import t from './translations.yml';

const routes = new Map([
    [
        'providerDashboard',
        {
            url: '/provider(?:/([a-z]+))?',
            handler: tab => ({
                t: t,
                title: 'dashboard',
                component: Dashboard,
                authentication: 'provider',
                props: { tab: tab || 'appointments' },
            }),
        },
    ],
]);

export default routes;
