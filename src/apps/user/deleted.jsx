// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    withSettings,
    Message,
    CenteredCard,
    CardHeader,
    A,
    T,
    CardContent,
} from 'components';
import t from './translations.yml';
import './deleted.scss';

export default withSettings(({ settings }) => (
    <CenteredCard className="kip-deleted">
        <CardHeader>
            <h1 className="bulma-subtitle">
                <T t={t} k="data-deleted" />
            </h1>
        </CardHeader>
        <CardContent>
            <Message type="success">
                <T
                    t={t}
                    k="thanks-for-using-us"
                    service={<strong key="service">{settings.get('title')}</strong>}
                />
            </Message>
        </CardContent>
    </CenteredCard>
));
