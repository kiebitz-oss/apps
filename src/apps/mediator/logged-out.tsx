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

const LoggedOutPage: React.FC = () => {
    return (
        <Box className="kip-logged-out">
            <BoxHeader>
                <Title>
                    <Trans id="logged-out.title"></Trans>
                </Title>
            </BoxHeader>

            <BoxContent>
                <Message variant="success">
                    <Trans id="logged-out.notice">
                        Sie wurden erfolgreich abgemeldet. Sie können sich
                        jederzeit mit Ihrer Schlüsseldatei wieder anmelden.
                    </Trans>
                </Message>
            </BoxContent>

            <BoxFooter>
                <Link href="/mediator" type="button">
                    <Trans id="logged-out.log-in-again">Einloggen</Trans>
                </Link>
            </BoxFooter>
        </Box>
    );
};

export default LoggedOutPage;
