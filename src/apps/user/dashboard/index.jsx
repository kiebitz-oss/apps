// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Appointments from './appointments';

import { keys } from 'apps/provider/actions';
import {
    userSecret,
    tokenData,
    invitationData,
    checkInvitationData,
} from 'apps/user/actions';
import {
    CenteredCard,
    CardHeader,
    CardContent,
    CardFooter,
    withSettings,
    withActions,
    withTimer,
    Icon,
    Tabs,
    Tab,
    T,
    A,
    Message,
} from 'components';
import { StoreOnline } from 'apps/user/setup/store-secrets';
import t from './translations.yml';

const Dashboard = withTimer(
    withActions(
        withSettings(
            ({
                route: {
                    handler: {
                        props: { tab, action },
                    },
                },
                settings,
                timer,
                keys,
                userSecret,
                keysAction,
                invitationDataAction,
                checkInvitationData,
                checkInvitationDataAction,
                tokenData,
                tokenDataAction,
            }) => {
                const [tv, setTv] = useState(-2);

                useEffect(() => {
                    // we do this only once per timer interval...
                    if (timer === tv) return;
                    setTv(timer);
                    keysAction().then(kd =>
                        tokenDataAction().then(td =>
                            checkInvitationDataAction(
                                kd.data,
                                td.data
                            ).then(() => invitationDataAction())
                        )
                    );
                });

                let content;

                switch (tab) {
                    case 'settings':
                        content = (
                            <Settings action={action} userSecret={userSecret} />
                        );
                        break;
                    case 'appointments':
                        content = <Appointments />;
                        break;
                }

                return (
                    <CenteredCard tight>
                        <CardHeader>
                            <Tabs>
                                <Tab
                                    icon={<Icon icon="calendar" />}
                                    active={tab === 'appointments'}
                                    href="/user/appointments"
                                >
                                    <T t={t} k="appointments.title" />
                                </Tab>
                                <Tab
                                    icon={<Icon icon="cogs" />}
                                    active={tab === 'settings'}
                                    href="/user/settings"
                                >
                                    <T t={t} k="settings.title" />
                                </Tab>
                                <Tab
                                    last
                                    icon={<Icon icon="sign-out-alt" />}
                                    active={tab === 'log-out'}
                                    href="/user/settings/logout"
                                >
                                    <T t={t} k="log-out" />
                                </Tab>
                            </Tabs>
                        </CardHeader>
                        {content}
                    </CenteredCard>
                );
            }
        ),
        [tokenData, keys, checkInvitationData, invitationData, userSecret]
    ),
    2000
);

export default Dashboard;

/*

*/
