// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Dashboard from './dashboard';
import Start from './start';
import Restore from './restore';
import Deleted from './deleted';
import LoggedOut from './logged-out';
import Setup from './setup';

const routes = new Map([
    [
        'providerIndex',
        {
            url: '/provider/?',
            handler: () => ({
                title: 'welcome',
                component: Start,
                isSimple: true,
                props: {},
            }),
        },
    ],
    [
        'restoreData',
        {
            url: '/provider/restore',
            handler: () => ({
                title: 'restore',
                component: Restore,
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
