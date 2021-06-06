// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Dashboard from './dashboard';
import Start from './start';
import Deleted from './deleted';
import LoggedOut from './logged-out';
import Setup from './setup';
import t from './translations.yml';

const routes = new Map([
    [
        'providerIndex',
        {
            url: '/provider/?',
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
        'providerDashboard',
        {
            url:
                '/provider(?:/(schedule|settings)(?:/([a-z0-9-]+))?(?:/([a-z0-9-]+))?(?:/([a-z0-9]+))?)?',
            handler: (tab, action, secondaryAction, id) => ({
                t: t,
                title: 'dashboard',
                component: Dashboard,
                isSimple: true,
                authentication: 'provider',
                props: {
                    tab: tab || 'schedule',
                    secondaryAction: secondaryAction,
                    action: action,
                    id: id,
                },
            }),
        },
    ],
    [
        'providerDeleted',
        {
            url: '/provider/deleted',
            handler: () => ({
                t: t,
                title: 'deleted',
                component: Deleted,
                isSimple: true,
                props: {},
            }),
        },
    ],
    [
        'providerLoggedOut',
        {
            url: '/provider/logged-out',
            handler: () => ({
                t: t,
                title: 'logged-out',
                component: LoggedOut,
                isSimple: true,
                props: {},
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
