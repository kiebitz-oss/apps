// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect } from 'react';
import { CenteredCard, CardContent, A } from 'components';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router';
import { useBackend } from 'hooks';

// styles are in 'apps/provider/start.scss'

const StartPage: React.FC = () => {
    const navigate = useNavigate();
    const backend = useBackend();

    useEffect(() => {
        if (backend.local.get('user::tokenData') !== null)
            navigate('/user/appointments');
    });

    return (
        <CenteredCard className="kip-cm-welcome">
            <CardContent>
                <h1 className="bulma-subtitle">
                    <Trans id="what-to-do" />
                </h1>

                <ul className="kip-cm-selector">
                    <li>
                        <A href="/user/setup">
                            <Trans id="setup" />
                        </A>
                    </li>
                    <li>
                        <A href="/user/restore">
                            <Trans id="restore" />
                        </A>
                    </li>
                </ul>
            </CardContent>
        </CenteredCard>
    );
};

export default StartPage;