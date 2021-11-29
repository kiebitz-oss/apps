// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Setup from './setup';
import Start from './start';
import Restore from './restore';
import Deleted from './deleted';
import LoggedOut from './logged-out';
import Dashboard from './dashboard';

const routes = new Map([
    [
        'userIndex',
        {
            url: '/?(?:user/?)?',
            handler: () => ({
                title: 'welcome',
                component: Start,
                isSimple: true,
                props: {},
            }),
        },
    ],
    [
        'restoreUserData',
        {
            url: '/user/restore',
            handler: () => ({
                title: 'restore',
                component: Restore,
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
