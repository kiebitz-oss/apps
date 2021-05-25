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
    updateAppointments,
    checkInvitations,
    verifiedProviderData,
    checkVerifiedProviderData,
} from './actions';
import {
    withSettings,
    withActions,
    withTimer,
    Tabs,
    Tab,
    T,
    A,
    Message,
} from 'components';
import t from './translations.yml';

const Dashboard = withTimer(
    withActions(
        withSettings(
            ({
                route: {
                    handler: {
                        props: { tab, action, id },
                    },
                },
                settings,
                providerData,
                providerDataAction,
                checkInvitations,
                checkInvitationsAction,
                verifiedProviderData,
                verifiedProviderDataAction,
                checkVerifiedProviderData,
                checkVerifiedProviderDataAction,
                updateAppointments,
                updateAppointmentsAction,
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
                    verifiedProviderDataAction();
                    providerDataAction().then(pd => {
                        // we check whether the data is verified already...
                        if (pd.data.verified) return;
                        checkVerifiedProviderDataAction(pd.data);
                    });
                    if (
                        keyPairs === undefined ||
                        verifiedProviderData === undefined ||
                        keyPairs.status !== 'loaded' ||
                        verifiedProviderData.status !== 'loaded'
                    )
                        return;
                    updateAppointmentsAction().then(d => {
                        sendInvitationsAction(
                            keyPairs.data,
                            verifiedProviderData.data
                        );
                        checkInvitationsAction(keyPairs, d.data);
                    });
                });

                let content;

                switch (tab) {
                    case 'settings':
                        content = <Settings />;
                        break;
                    case 'schedule':
                        content = <Schedule action={action} id={id} />;
                        break;
                }

                let invalidKeyMessage;

                if (
                    validKeyPairs !== undefined &&
                    validKeyPairs.valid === false
                ) {
                    invalidKeyMessage = (
                        <Message type="danger">
                            <T t={t} k="invalid-key" />
                        </Message>
                    );
                }

                return (
                    <F>
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
                        </Tabs>
                        {invalidKeyMessage}
                        {content}
                    </F>
                );
            }
        ),
        [
            verifiedProviderData,
            updateAppointments,
            sendInvitations,
            keyPairs,
            keys,
            validKeyPairs,
            providerData,
            checkInvitations,
            checkVerifiedProviderData,
        ]
    ),
    2000
);

export default Dashboard;
