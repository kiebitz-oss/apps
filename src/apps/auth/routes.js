// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Login from './login';
import t from './translations.yml';

const routes = new Map([
    [
        'login',
        {
            url: '/login?',
            handler: () => ({
                t: t,
                title: 'login',
                component: Login,
                isSimple: true,
                props: {},
            }),
        },
    ],
]);

export default routes;
