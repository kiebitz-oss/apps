// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Schedule from './schedule';

import {
    keyPairs,
    keys,
    validKeyPairs,
    providerData,
    sendInvitations,
    openAppointments,
    checkInvitations,
    verifiedProviderData,
    checkVerifiedProviderData,
} from '../actions';
import {
    withSettings,
    withActions,
    withTimer,
    withRouter,
    CenteredCard,
    CardHeader,
    Icon,
    CardContent,
    Tabs,
    Tab,
    T,
    A,
    Message,
} from 'components';
import t from './translations.yml';

const Dashboard = withRouter(
    withActions(
        withSettings(
            withTimer(
                ({
                    route: {
                        handler: {
                            props: { tab, action, id },
                        },
                    },
                    router,
                    settings,
                    openAppointments,
                    openAppointmentsAction,
                    providerData,
                    providerDataAction,
                    checkInvitations,
                    checkInvitationsAction,
                    verifiedProviderData,
                    verifiedProviderDataAction,
                    checkVerifiedProviderData,
                    checkVerifiedProviderDataAction,
                    timer,
                    keys,
                    keysAction,
                    sendInvitations,
                    sendInvitationsAction,
                    keyPairs,
                    keyPairsAction,
                    validKeyPairs,
                    validKeyPairsAction,
                }) => {
                    const [initialized, setInitialized] = useState(false);
                    const [lastUpdated, setLastUpdated] = useState('');
                    const [tv, setTv] = useState(-1);

                    useEffect(() => {
                        if (initialized) return;
                        setInitialized(true);
                        keysAction().then(ks =>
                            keyPairsAction().then(kp =>
                                validKeyPairsAction(kp.data, ks.data)
                            )
                        );
                    });

                    useEffect(() => {
                        // we do this only once per timer interval...
                        if (timer === tv) return;
                        setTv(timer);
                        setLastUpdated(new Date().toLocaleTimeString());
                        verifiedProviderDataAction();
                        providerDataAction().then(pd => {
                            if (
                                pd.data === null ||
                                pd.data.submitted === undefined
                            )
                                router.navigateToUrl('/provider/setup');
                            // we check whether the data is verified already...
                            if (pd.data.verified) return;
                            checkVerifiedProviderDataAction(pd.data).then(() =>
                                keysAction().then(ks =>
                                    keyPairsAction().then(kp =>
                                        validKeyPairsAction(kp.data, ks.data)
                                    )
                                )
                            );
                        });
                        if (
                            keyPairs === undefined ||
                            verifiedProviderData === undefined ||
                            keyPairs.status !== 'loaded' ||
                            verifiedProviderData.status !== 'loaded'
                        )
                            return;
                        openAppointmentsAction().then(d =>
                            sendInvitationsAction(
                                keyPairs.data,
                                verifiedProviderData.data
                            ).then(() =>
                                checkInvitationsAction(keyPairs, d.data)
                            )
                        );
                    });

                    let content;

                    switch (tab) {
                        case 'settings':
                            content = (
                                <Settings key="settings" action={action} />
                            );
                            break;
                        case 'schedule':
                            content = (
                                <Schedule
                                    action={action}
                                    id={id}
                                    key="schedule"
                                    lastUpdated={lastUpdated}
                                />
                            );
                            break;
                    }

                    let invalidKeyMessage;

                    if (
                        validKeyPairs !== undefined &&
                        validKeyPairs.valid === false
                    ) {
                        invalidKeyMessage = (
                            <Message waiting type="warning">
                                <T t={t} k="invalid-key" />
                            </Message>
                        );
                    }

                    return (
                        <CenteredCard size="fullwidth" tight>
                            <CardHeader>
                                <Tabs>
                                    <Tab
                                        active={tab === 'schedule'}
                                        href="/provider/schedule"
                                    >
                                        <T t={t} k="schedule.title" />
                                    </Tab>
                                    <Tab
                                        active={tab === 'settings'}
                                        href="/provider/settings"
                                    >
                                        <T t={t} k="settings.title" />
                                    </Tab>
                                    <Tab
                                        last
                                        icon={<Icon icon="sign-out-alt" />}
                                        active={tab === 'log-out'}
                                        href="/provider/settings/logout"
                                    >
                                        <T t={t} k="log-out" />
                                    </Tab>
                                </Tabs>
                            </CardHeader>
                            {invalidKeyMessage}
                            {content}
                        </CenteredCard>
                    );
                },
                10000
            )
        ),
        [
            verifiedProviderData,
            sendInvitations,
            keyPairs,
            keys,
            validKeyPairs,
            providerData,
            checkInvitations,
            openAppointments,
            checkVerifiedProviderData,
        ]
    )
);

export default Dashboard;
