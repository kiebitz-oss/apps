// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import {
    withActions,
    withSettings,
    withRouter,
    CenteredCard,
    CardContent,
    A,
    T,
} from 'components';
import { providerData } from 'apps/provider/actions';
import t from './translations.yml';
import './start.scss';

export default withActions(
    withRouter(
        withSettings(
            ({ providerData, providerDataAction, router, settings }) => {
                const [initialized, setInitialized] = useState(false);
                useEffect(() => {
                    if (initialized) return;
                    setInitialized(true);
                    providerDataAction().then(pd => {
                        if (
                            pd !== undefined &&
                            pd.data !== undefined &&
                            pd.data.submitted
                        )
                            router.navigateToUrl('/provider/schedule');
                    });
                });
                return (
                    <CenteredCard className="kip-cm-welcome">
                        <CardContent>
                            <h1 className="bulma-subtitle">
                                <T t={t} k="what-to-do" />
                            </h1>
                            <ul className="kip-cm-selector">
                                <li>
                                    <A href="/provider/setup">
                                        <T t={t} k="setup" />
                                    </A>
                                </li>
                                <li>
                                    <A href="/provider/restore">
                                        <T t={t} k="restore" />
                                    </A>
                                </li>
                            </ul>
                        </CardContent>
                    </CenteredCard>
                );
            }
        )
    ),
    [providerData]
);
