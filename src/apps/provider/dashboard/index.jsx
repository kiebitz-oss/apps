// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import Settings from './settings';
import Schedule from './schedule';
import {
    useProvider,
    useRouter,
    useSettings,
    useInterval,
    useEffectOnce,
} from 'hooks';

import {
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

const Dashboard = ({
    route: {
        handler: {
            props: { tab, action, secondaryAction, id },
        },
    },
    route,
}) => {
    const provider = useProvider();

    useInterval(async () => {
        const response = await provider.checkData().get();
    }, 10000);

    let content;

    switch (tab) {
        case 'settings':
            content = <Settings key="settings" action={action} />;
            break;
        case 'schedule':
            content = (
                <Schedule
                    action={action}
                    route={route}
                    secondaryAction={secondaryAction}
                    id={id}
                    key="schedule"
                />
            );
            break;
    }

    let invalidKeyMessage;

    if (provider.verifiedData === null) {
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
                    <Tab active={tab === 'schedule'} href="/provider/schedule">
                        <T t={t} k="schedule.title" />
                    </Tab>
                    <Tab active={tab === 'settings'} href="/provider/settings">
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
};

export default Dashboard;
