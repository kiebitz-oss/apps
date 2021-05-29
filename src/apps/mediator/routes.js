// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Dashboard from './dashboard';
import t from './translations.yml';

const routes = new Map([
    [
        'mediatorDashboard',
        {
            url: '/mediator(?:/([a-z]+))?(?:/([a-z]+))?(?:/([a-z0-9]+))?',
            handler: (tab, action, id) => ({
                t: t,
                title: 'dashboard',
                component: Dashboard,
                isSimple: true,
                props: { tab: tab || 'providers', action: action, id: id },
            }),
        },
    ],
]);

export default routes;
