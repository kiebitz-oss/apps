// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Appointments from './appointments';
import { keys } from 'apps/provider/actions';
import { useUser } from 'hooks';
import {
    userSecret,
    backupData,
    queueData,
    tokenData,
    getAppointments,
    invitation,
    appointments,
} from 'apps/user/actions';
import {
    CenteredCard,
    CardHeader,
    CardContent,
    CardFooter,
    withRouter,
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

const Dashboard = withRouter(
    withTimer(
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
                    router,
                    userSecret,
                    userSecretAction,
                    keysAction,
                    backupDataAction,
                    invitationAction,
                    appointmentsAction,
                    getAppointments,
                    getAppointmentsAction,
                    queueData,
                    queueDataAction,
                    tokenDataAction,
                }) => {
                    const [tv, setTv] = useState(-2);
                    const user = useUser();

                    useEffect(() => {
                        // we do this only once per timer interval...
                        if (timer === tv) return;
                        setTv(timer);
                        userSecretAction().then((us) =>
                            tokenDataAction().then(() =>
                                keysAction().then((kd) =>
                                    queueDataAction().then((qd) => {
                                        getAppointmentsAction(qd.data, kd.data);
                                        backupDataAction(us.data);
                                        invitationAction();
                                        appointmentsAction();
                                    })
                                )
                            )
                        );
                    });

                    let content;
                    let menu;

                    user.getKeys().then((keys) => console.log(keys));

                    switch (tab) {
                        case 'settings':
                            content = <Settings action={action} />;
                            menu = (
                                <A href={'/user/appointments'}>
                                    <span className="kip-icon">
                                        <Icon icon="chevron-left" />{' '}
                                        <T t={t} k="go-back.button" />
                                    </span>
                                </A>
                            );
                            break;
                        case 'appointments':
                            content = <Appointments />;
                            menu = (
                                <A href={'/user/settings'}>
                                    <span className="kip-icon">
                                        <Icon icon="cogs" />
                                    </span>
                                </A>
                            );
                            break;
                    }

                    return (
                        <CenteredCard tight>
                            <CardHeader>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        paddingBottom: '13px',
                                    }}
                                >
                                    {menu}
                                </div>
                            </CardHeader>
                            {content}
                        </CenteredCard>
                    );
                }
            ),
            [
                keys,
                invitation,
                appointments,
                queueData,
                tokenData,
                getAppointments,
                userSecret,
                backupData,
            ]
        ),
        10000
    )
);

export default Dashboard;

/*

*/
