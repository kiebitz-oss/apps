// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Setup from './setup';
import Start from './start';
import Deleted from './deleted';
import LoggedOut from './logged-out';
import Dashboard from './dashboard';
import t from './translations.yml';

const routes = new Map([
    [
        'userIndex',
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
        'userDeleted',
        {
            url: '/user/deleted',
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
        'userLoggedOut',
        {
            url: '/user/logged-out',
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
        'userDashboard',
        {
            url: '/user/(appointments|settings)(?:/([a-z]+))?',
            handler: (tab, action) => ({
                t: t,
                title: 'dashboard',
                component: Dashboard,
                isSimple: true,
                props: { tab: tab, action: action },
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
