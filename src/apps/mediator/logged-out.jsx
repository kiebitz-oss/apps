// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    Message,
    CenteredCard,
    CardHeader,
    CardContent,
    CardFooter,
    Button,
    A,
    T,
} from 'components';
import { useSettings } from 'hooks';
import t from './translations.yml';
import './logged-out.scss';

export default () => {
    const settings = useSettings();
    return (
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
                            <strong key="service">
                                {settings.get('title')}
                            </strong>
                        }
                    />
                </Message>
            </CardContent>
            <CardFooter>
                <Button href="/mediator">
                    <T t={t} k="logged-out.log-in-again" />
                </Button>
            </CardFooter>
        </CenteredCard>
    );
};
