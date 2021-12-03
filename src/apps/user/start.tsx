// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect } from 'react';
import { CenteredCard, CardContent, A } from 'components';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router';
import { useUserTokenData } from 'hooks/useUserTokenData';

// styles are in 'apps/provider/start.scss'

const StartPage: React.FC = () => {
    const navigate = useNavigate();
    const userTokenData = useUserTokenData();

    useEffect(() => {
        if (userTokenData !== null) {
            navigate('/user/appointments');
        }
    }, [navigate, userTokenData]);

    return (
        <CenteredCard className="kip-cm-welcome" style={{ maxWidth: '300px' }}>
            <CardContent>
                <h1 className="bulma-subtitle">
                    <Trans id="what-to-do">Was möchtest Du tun?</Trans>
                </h1>

                <div
                    className="bulma-is-flex"
                    style={{
                        flexDirection: 'column',
                        gap: '.5rem',
                    }}
                >
                    <A href="/user/setup" type="button" variant="primary">
                        <Trans id="setup">Impftermin finden</Trans>
                    </A>
                    <A href="/user/restore" type="button" variant="primary">
                        <Trans id="restore">Termin und Profil bearbeiten</Trans>
                    </A>
                </div>
            </CardContent>
        </CenteredCard>
    );
};

export default StartPage;
