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
} from 'components';
import { Trans } from '@lingui/macro';
import './deleted.scss';

export default withSettings(({ settings }) => (
    <CenteredCard className="kip-deleted">
        <CardHeader>
            <h1 className="bulma-subtitle">
                <Trans id="data-deleted">Daten erfolgreich gelöscht</Trans>
            </h1>
        </CardHeader>
        <Message type="success">
            <Trans
                id="thanks-for-using-us"
                values={{ service: (<strong key="service">{settings.get('title')}</strong>) }}
            >
                Ihre Daten wurden erfolgreich gelöscht. Vielen Dank, dass Sie {service} genutzt haben!
            </Trans>
        </Message>
    </CenteredCard>
));
