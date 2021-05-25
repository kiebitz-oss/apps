// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Appointments from './appointments';

import { keys } from 'apps/provider/dashboard/actions';
import { tokenData, invitationData, checkInvitationData } from './actions';
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
                        props: { tab, action },
                    },
                },
                settings,
                timer,
                keys,
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
                        content = <Settings action={action} />;
                        break;
                    case 'appointments':
                        content = <Appointments />;
                        break;
                }

                return (
                    <F>
                        <Tabs>
                            <Tab
                                active={tab === 'appointments'}
                                href="/user/appointments"
                            >
                                <T t={t} k="appointments.title" />
                            </Tab>
                            <Tab
                                active={tab === 'settings'}
                                href="/user/settings"
                            >
                                <T t={t} k="settings.title" />
                            </Tab>
                        </Tabs>
                        {content}
                    </F>
                );
            }
        ),
        [tokenData, keys, checkInvitationData, invitationData]
    ),
    2000
);

export default Dashboard;
