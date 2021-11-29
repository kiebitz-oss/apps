// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';

import { user } from 'actions';
import { withActions, CenteredCard, CardContent } from 'components';
import './index.scss';
import { useNavigate } from 'react-router-dom';

const Login = withActions(
    ({ userAction, user }) => {
        const [ok, setOk] = useState(false);
        const navigate = useNavigate();

        useEffect(() => {
            if (user !== undefined) {
                if (hash.redirectTo !== undefined) navigate(hash.redirectTo);
                else navigate('/');
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
);
export default Login;
