// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect } from 'react';
import {
    withSettings,
    withRouter,
    CenteredCard,
    CardContent,
    A,
    T,
} from 'components';
import t from './translations.yml';
import './start.scss';

export default withRouter(
    withSettings(({ router, settings }) => {
        useEffect(() => {
            const backend = settings.get('backend');
            if (backend.local.get('provider::data') !== null)
                router.navigateToUrl('/provider/schedule');
            else router.navigateToUrl('/provider/setup');
        });
        return (
            <CenteredCard className="kip-cm-welcome">
                <CardContent>
                    <h1 className="bulma-subtitle">
                        <T t={t} k="what-to-do" />
                    </h1>
                    <ul className="kip-cm-selector">
                        <li>
                            <A href="/provide/setup">
                                <T t={t} k="setup" />
                            </A>
                        </li>
                    </ul>
                </CardContent>
            </CenteredCard>
        );
    })
);
