// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Appointments from './appointments';
import { useUser, useEffectOnce } from 'hooks';

import {
    CenteredCard,
    CardHeader,
    CardContent,
    CardFooter,
    withRouter,
    withTimer,
    Icon,
    Tabs,
    Tab,
    T,
    A,
    Message,
} from 'components';

import t from './translations.yml';

export default withRouter(
    withTimer(
        ({
            route: {
                handler: {
                    props: { tab, action },
                },
            },
            settings,
            timer,
            router,
        }) => {
            const [tv, setTv] = useState(-2);
            const user = useUser();

            let content;
            let menu;

            useEffectOnce(async () => {
                const fromDate = new Date();
                const toDate = new Date();
                toDate.setUTCDate(toDate.getUTCDate() + 1);

                const appointments = await user.appointments().get({
                    zipCode: '10707',
                    from: fromDate.toISOString(),
                    to: toDate.toISOString(),
                });

                console.log(appointments);
            });

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
    10000
);
