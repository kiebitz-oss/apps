// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { NotFound } from 'components';

// Routes are matched in order, so be sure to put a specific route like
// /actions/new before /actions/(${id}) which would match "new" as well.
const routes = new Map([
    /*    [
        "appSelector",
        {
            url: "/?",
            handler: () => ({
                title: "appSelector",
                component: AppSelector,
                isSimple: true
            })
        }
    ],*/
    [
        'notFound',
        {
            handler: () => ({
                title: 'notFound',
                component: NotFound,
                isSimple: true,
            }),
        },
    ],
]);

export default routes;
