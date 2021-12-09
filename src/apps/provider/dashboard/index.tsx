// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
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
} from 'apps/provider/actions';
import { withActions } from 'components';
import { Box, BoxHeader, Tabs, Tab, Message } from 'ui';
import { Trans } from '@lingui/macro';
import { useParams } from 'react-router';
import { useEffectOnce, useInterval } from 'react-use';
import { SettingsTab } from './settings';
import { ScheduleTab } from './schedule';

const DashboardPage: React.FC<any> = ({
    openAppointmentsAction,
    providerDataAction,
    submitProviderDataAction,
    verifiedProviderData,
    verifiedProviderDataAction,
    checkVerifiedProviderDataAction,
    keysAction,
    backupDataAction,
    providerSecretAction,
    publishAppointmentsAction,
    getAppointmentsAction,
    keyPairs,
    keyPairsAction,
}) => {
    const [lastUpdated, setLastUpdated] = useState('');

    const { tab } = useParams();

    useEffectOnce(() => {
        verifiedProviderDataAction();
        keysAction().then(() => keyPairsAction());
    });

    useInterval(() => {
        // we do this only once per timer interval...
        setLastUpdated(new Date().toLocaleTimeString());
        openAppointmentsAction();
        keysAction().then((ks: any) =>
            keyPairsAction().then((kp: any) => {
                // we first publish appointments to e.g.
                // notify the backend of changes
                publishAppointmentsAction(kp.data).finally(() => {
                    // then we fetch appointments
                    getAppointmentsAction(kp.data);
                });

                providerSecretAction().then((ps: any) =>
                    backupDataAction(kp.data, ps.data)
                );

                providerDataAction().then((pd: any) => {
                    if (
                        pd.data.submittedAt === undefined ||
                        pd.data.version !== '0.4'
                    ) {
                        // we try to submit the data...
                        submitProviderDataAction(pd.data, kp.data, ks.data);
                    } else {
                        verifiedProviderDataAction().then((vd: any) => {
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
    }, 10000);

    let content;

    switch (tab) {
        case 'settings':
            content = <SettingsTab />;
            break;

        default:
        case 'schedule':
            content = <ScheduleTab lastUpdated={lastUpdated} />;
            break;
    }

    let invalidKeyMessage;

    if (
        verifiedProviderData === undefined ||
        verifiedProviderData.status !== 'loaded' ||
        verifiedProviderData.data === null
    ) {
        invalidKeyMessage = (
            <Message waiting variant="warning">
                <Trans id="invalid-key">
                    Ihre Daten wurden noch nicht verifiziert. Sie können bereits
                    Termine anlegen, allerdings werden Impfwillige noch nicht
                    über Ihre Termine benachrichtigt.
                </Trans>
            </Message>
        );
    }

    return (
        <Box variant="tight" className="mt-12">
            <BoxHeader>
                <Tabs>
                    <Tab current={tab === 'schedule'} href="/provider/schedule">
                        <Trans id="schedule.title">Terminplan</Trans>
                    </Tab>
                    <Tab current={tab === 'settings'} href="/provider/settings">
                        <Trans id="settings.title">Einstellungen</Trans>
                    </Tab>
                    <Tab current={tab === 'log-out'} href="/provider/log-out">
                        <Trans id="log-out">Abmelden</Trans>
                    </Tab>
                </Tabs>
            </BoxHeader>

            {invalidKeyMessage}
            {content}
        </Box>
    );
};

export default withActions(DashboardPage, [
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
