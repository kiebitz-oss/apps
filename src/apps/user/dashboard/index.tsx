// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import Settings from './settings';
import Appointments from './appointments';
import { keys } from 'apps/provider/actions';
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
    withActions,
    withTimer,
    Icon,
    A,
} from 'components';
import { Trans } from '@lingui/macro';
import { useParams } from 'react-router-dom';

const DashboardPage: React.FC<any> = ({
    timer,
    userSecretAction,
    keysAction,
    backupDataAction,
    invitationAction,
    appointmentsAction,
    getAppointmentsAction,
    queueDataAction,
    tokenDataAction,
}) => {
    const [tv, setTv] = useState(-2);
    const { tab, action } = useParams();

    useEffect(() => {
        // we do this only once per timer interval...
        if (timer === tv) return;
        setTv(timer);
        userSecretAction().then((us: any) =>
            tokenDataAction().then(() =>
                keysAction().then((kd: any) =>
                    queueDataAction().then((qd: any) => {
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

    switch (tab) {
        case 'settings':
            content = <Settings action={action} />;
            menu = (
                <A href={'/user/appointments'}>
                    <span className="kip-icon">
                        <Icon icon="chevron-left" />{' '}
                        <Trans id="go-back.button" />
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
};

export default withTimer(
    withActions(DashboardPage, [
        keys,
        invitation,
        appointments,
        queueData,
        tokenData,
        getAppointments,
        userSecret,
        backupData,
    ]),
    10000
);
