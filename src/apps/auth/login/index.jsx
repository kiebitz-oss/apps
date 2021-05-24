// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';

import { user } from 'actions';
import { withRouter, withActions, CenteredCard, CardContent } from 'components';
import './index.scss';

const Login = withRouter(
    withActions(
        ({ userAction, user, route, router }) => {
            const [ok, setOk] = useState(false);

            useEffect(() => {
                if (user !== undefined) {
                    if (route.hashParams.redirectTo !== undefined)
                        router.navigateToUrl(route.hashParams.redirectTo);
                    else router.navigateTo('/');
                }
                if (!ok) {
                    setOk(true);
                    userAction({});
                }
            });

            return (
                <CenteredCard className="kip-cm-wizard">
                    <CardContent>Test</CardContent>
                </CenteredCard>
            );
        },
        [user]
    )
);

export default Login;
