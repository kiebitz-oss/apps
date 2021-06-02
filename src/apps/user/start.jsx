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
            if (backend.local.get('user::tokenData') !== null)
                router.navigateToUrl('/user/appointments');
            else router.navigateToUrl('/user/setup');
        });
        return (
            <CenteredCard className="kip-cm-welcome">
                <CardContent>
                    <h1 className="bulma-subtitle">
                        <T t={t} k="what-to-do" />
                    </h1>
                    <ul className="kip-cm-selector">
                        <li>
                            <A href="/user/setup">
                                <T t={t} k="setup" />
                            </A>
                        </li>
                        <li>
                            <A href="/user/restore">
                                <T t={t} k="restore" />
                            </A>
                        </li>
                        <li>
                            <A href="/user/help">
                                <T t={t} k="show-help" />
                            </A>
                        </li>
                    </ul>
                </CardContent>
            </CenteredCard>
        );
    })
);
