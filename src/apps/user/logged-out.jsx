// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    withSettings,
    Message,
    CenteredCard,
    CardHeader,
    CardContent,
    CardFooter,
    Button,
    A,
    T,
} from 'components';
import t from './translations.yml';
import './logged-out.scss';

export default withSettings(({ settings }) => (
    <CenteredCard className="kip-logged-out">
        <CardHeader>
            <h1 className="bulma-subtitle">
                <T t={t} k="logged-out.title" />
            </h1>
        </CardHeader>
        <CardContent>
            <Message type="success">
                <T
                    t={t}
                    k="logged-out.notice"
                    service={
                        <strong key="service">{settings.get('title')}</strong>
                    }
                />
            </Message>
        </CardContent>
        <CardFooter>
            <Button href="/user/restore">
                <T t={t} k="logged-out.log-in-again" />
            </Button>
        </CardFooter>
    </CenteredCard>
));
