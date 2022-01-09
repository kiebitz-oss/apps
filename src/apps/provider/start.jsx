// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { CenteredCard, CardContent, A, T } from 'components';
import { useProvider, useRouter, useEffectOnce } from 'hooks';
import t from './translations.yml';
import './start.scss';

export default () => {
    const router = useRouter();
    const provider = useProvider();
    useEffectOnce(() => {
        if (provider.data && provider.data.submittedAt)
            router.navigateToUrl('/provider/schedule');
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
};
