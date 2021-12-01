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

const LoggedOutPage: React.FC<any> = () => {
    return (
        <CenteredCard className="kip-logged-out">
            <CardHeader>
                <h1 className="bulma-subtitle">
                    <Trans id="logged-out.title"></Trans>
                </h1>
            </CardHeader>
            <CardContent>
                <Message type="success">
                    <Trans id="logged-out.notice">
                        Sie wurden erfolgreich abgemeldet. Sie können sich
                        jederzeit mit Ihrer Schlüsseldatei wieder anmelden.
                    </Trans>
                </Message>
            </CardContent>
            <CardFooter>
                <Button href="/mediator">
                    <Trans id="logged-out.log-in-again">Einloggen</Trans>
                </Button>
            </CardFooter>
        </CenteredCard>
    );
};

export default LoggedOutPage;
