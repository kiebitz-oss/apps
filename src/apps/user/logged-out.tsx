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
} from 'components';
import { Trans } from '@lingui/macro';

const LoggedOutPage: React.FC = () => (
    <CenteredCard className="kip-logged-out">
        <CardHeader>
            <h1 className="bulma-subtitle">
                <Trans id="logged-out.title">Erfolgreich abgemeldet.</Trans>
            </h1>
        </CardHeader>
        <CardContent>
            <Message type="success">
                <Trans id="logged-out.notice">
                    Du wurdest erfolgreich abgemeldet. Du kannst dich jederzeit
                    wieder mit deinem Sicherheitscode anmelden um deine Termine
                    zu prüfen.
                </Trans>
            </Message>
        </CardContent>
        <CardFooter>
            <Button href="/user/restore">
                <Trans id="logged-out.log-in-again">Anmelden</Trans>
            </Button>
        </CardFooter>
    </CenteredCard>
);

export default LoggedOutPage;
