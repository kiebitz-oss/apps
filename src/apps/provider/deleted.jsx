// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Message, CenteredCard, CardHeader, A, T } from 'components';
import { Trans } from '@lingui/macro';
import './deleted.scss';
import { useSettings } from 'hooks';

const DeletedPage = () => {
    const settings = useSettings();

    return (
        <CenteredCard className="kip-deleted">
            <CardHeader>
                <h1 className="bulma-subtitle">
                    <Trans id="data-deleted">Daten erfolgreich gelöscht</Trans>
                </h1>
            </CardHeader>
            <Message type="success">
                <Trans id="thanks-for-using-us">
                    Ihre Daten wurden erfolgreich gelöscht. Vielen Dank, dass
                    Sie <strong key="service">{settings.get('title')}</strong>{' '}
                    genutzt haben!
                </Trans>
            </Message>
        </CenteredCard>
    );
};

export default DeletedPage;
