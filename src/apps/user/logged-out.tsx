// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Trans } from '@lingui/macro';
import {
    Message,
    Box,
    BoxHeader,
    BoxContent,
    BoxFooter,
    Link,
    Title,
} from 'ui';

const LoggedOutPage: React.FC = () => (
    <Box className="kip-logged-out">
        <BoxHeader>
            <Title>
                <Trans id="logged-out.title">Erfolgreich abgemeldet.</Trans>
            </Title>
        </BoxHeader>

        <BoxContent>
            <Message variant="success">
                <Trans id="logged-out.notice">
                    Du wurdest erfolgreich abgemeldet. Du kannst dich jederzeit
                    wieder mit deinem Sicherheitscode anmelden um deine Termine
                    zu prüfen.
                </Trans>
            </Message>
        </BoxContent>

        <BoxFooter>
            <Link type="button" variant="primary" href="/user">
                <Trans id="logged-out.log-in-again">Anmelden</Trans>
            </Link>
        </BoxFooter>
    </Box>
);

export default LoggedOutPage;
