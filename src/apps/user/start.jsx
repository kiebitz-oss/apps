// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { CenteredCard, CardContent, A, T } from 'components';
import t from './translations.yml';
import './start.scss';

export default () => (
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
