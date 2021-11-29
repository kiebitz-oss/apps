// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Login from './login';

const routes = new Map([
    [
        'login',
        {
            url: '/login?',
            handler: () => ({
                title: 'login',
                component: Login,
                isSimple: true,
                props: {},
            }),
        },
    ],
]);

export default routes;
