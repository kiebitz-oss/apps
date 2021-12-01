// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import { withActions, CenteredCard, CardContent, A } from 'components';
import { providerData } from 'apps/provider/actions';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import './start.scss';

const StartPage: React.FC<any> = ({ providerDataAction }) => {
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        providerDataAction().then(pd => {
            if (
                pd !== undefined &&
                pd.data !== undefined &&
                pd.data.submittedAt !== undefined
            )
                navigate('/provider/schedule');
        });
    });

    return (
        <CenteredCard className="kip-cm-welcome">
            <CardContent>
                <h1 className="bulma-subtitle">
                    <Trans id="what-to-do">Was möchten Sie tun?</Trans>
                </h1>
                <ul className="kip-cm-selector">
                    <li>
                        <A href="/provider/setup">
                            <Trans id="setup">Als Arzt registrieren</Trans>
                        </A>
                    </li>
                    <li>
                        <A href="/provider/restore">
                            <Trans id="restore">Einloggen</Trans>
                        </A>
                    </li>
                </ul>
            </CardContent>
        </CenteredCard>
    );
};

export default withActions(StartPage, [providerData]);
