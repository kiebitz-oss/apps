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
import { Trans } from '@lingui/macro';
import './logged-out.scss';

export default withSettings(({ settings }) => (
    <CenteredCard className="kip-logged-out">
        <CardHeader>
            <h1 className="bulma-subtitle">
                <Trans id="logged-out.title">Erfolgreich abgemeldet.</Trans>
            </h1>
        </CardHeader>
        <CardContent>
            <Message type="success">
                <Trans
                    id="logged-out.notice"
                    values={{ 
                        service: (
                          <strong key="service">{settings.get('title')}</strong>
                        )
                    }}
                 >
                     Du wurdest erfolgreich abgemeldet. Du kannst dich jederzeit wieder mit deinem Sicherheitscode anmelden um deine Termine zu prüfen.
                </Trans>
            </Message>
        </CardContent>
        <CardFooter>
            <Button href="/user/restore">
                <Trans id="logged-out.log-in-again">Anmelden</Trans>
            </Button>
        </CardFooter>
    </CenteredCard>
));
