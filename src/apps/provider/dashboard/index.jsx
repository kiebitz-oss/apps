// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Schedule from './schedule';

import {
    keyPairs,
    keys,
    providerData,
    backupData,
    getAppointments,
    publishAppointments,
    providerSecret,
    openAppointments,
    submitProviderData,
    verifiedProviderData,
    checkVerifiedProviderData,
} from '../actions';
import {
    withActions,
    withTimer,
    CenteredCard,
    CardHeader,
    Icon,
    Tabs,
    Tab,
    Message,
} from 'components';
import { Trans } from '@lingui/macro';
import { useParams } from 'react-router';

const DashboardPage = ({
    openAppointmentsAction,
    providerDataAction,
    submitProviderDataAction,
    verifiedProviderData,
    verifiedProviderDataAction,
    checkVerifiedProviderDataAction,
    timer,
    keysAction,
    backupDataAction,
    providerSecretAction,
    publishAppointmentsAction,
    getAppointmentsAction,
    keyPairs,
    keyPairsAction,
}) => {
    const [initialized, setInitialized] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const [tv, setTv] = useState(-1);
    const { tab, action, secondaryAction, id } = useParams();

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        verifiedProviderDataAction();
        keysAction().then(() => keyPairsAction());
    });

    useEffect(() => {
        // we do this only once per timer interval...
        if (timer === tv) return;
        setTv(timer);
        setLastUpdated(new Date().toLocaleTimeString());
        openAppointmentsAction();
        keysAction().then(ks =>
            keyPairsAction().then(kp => {
                // we first publish appointments to e.g.
                // notify the backend of changes
                publishAppointmentsAction(kp.data).finally(() => {
                    // then we fetch appointments
                    getAppointmentsAction(kp.data);
                });

                providerSecretAction().then(ps =>
                    backupDataAction(kp.data, ps.data)
                );

                providerDataAction().then(pd => {
                    if (
                        pd.data.submittedAt === undefined ||
                        pd.data.version !== '0.4'
                    ) {
                        // we try to submit the data...
                        submitProviderDataAction(pd.data, kp.data, ks.data);
                    } else {
                        verifiedProviderDataAction().then(vd => {
                            if (vd === undefined) {
                                return;
                            }

                            if (
                                vd.data === null &&
                                pd.data.submittedAt !== undefined &&
                                new Date(pd.data.submittedAt) <
                                    new Date(
                                        new Date().getTime() - 1000 * 60 * 15
                                    )
                            ) {
                                // no verified provider data yet, we submit the data again
                                submitProviderDataAction(
                                    pd.data,
                                    kp.data,
                                    ks.data
                                );
                            }
                        });
                    }

                    // we always check for updates in the verified provider data
                    checkVerifiedProviderDataAction(pd.data, kp.data);
                });
            })
        );

        if (
            keyPairs === undefined ||
            keyPairs.status !== 'loaded' ||
            verifiedProviderData === undefined ||
            verifiedProviderData.status !== 'loaded' ||
            verifiedProviderData.data === null
        )
            return;
    });

    let content;

    switch (tab) {
        case 'settings':
            content = <Settings key="settings" action={action} />;
            break;

        default:
        case 'schedule':
            content = (
                <Schedule
                    action={action}
                    secondaryAction={secondaryAction}
                    id={id}
                    key="schedule"
                    lastUpdated={lastUpdated}
                />
            );
            break;
    }

    let invalidKeyMessage;

    if (
        verifiedProviderData === undefined ||
        verifiedProviderData.status !== 'loaded' ||
        verifiedProviderData.data === null
    ) {
        invalidKeyMessage = (
            <Message waiting type="warning">
                <Trans id="invalid-key">
                    Ihre Daten wurden noch nicht verifiziert. Sie können bereits
                    Termine anlegen, allerdings werden Impfwillige noch nicht
                    über Ihre Termine benachrichtigt.
                </Trans>
            </Message>
        );
    }

    return (
        <CenteredCard size="fullwidth" tight>
            <CardHeader>
                <Tabs>
                    <Tab active={tab === 'schedule'} href="/provider/schedule">
                        <Trans id="schedule.title">Terminplan</Trans>
                    </Tab>
                    <Tab active={tab === 'settings'} href="/provider/settings">
                        <Trans id="settings.title">Einstellungen</Trans>
                    </Tab>
                    <Tab
                        last
                        icon={<Icon icon="sign-out-alt" />}
                        active={tab === 'log-out'}
                        href="/provider/settings/logout"
                    >
                        <Trans id="log-out">Abmelden</Trans>
                    </Tab>
                </Tabs>
            </CardHeader>
            {invalidKeyMessage}
            {content}
        </CenteredCard>
    );
};

export default withActions(withTimer(DashboardPage, 10000), [
    verifiedProviderData,
    getAppointments,
    publishAppointments,
    keyPairs,
    keys,
    backupData,
    providerSecret,
    providerData,
    submitProviderData,
    openAppointments,
    checkVerifiedProviderData,
]);
