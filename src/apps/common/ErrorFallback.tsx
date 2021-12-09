// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Trans } from '@lingui/macro';
import { Box, Link, Message } from 'ui';
import { useSettings } from 'hooks';

export const ErrorFallback: React.FC = () => {
    const settings = useSettings();
    const supportEmail = settings.get('supportEmail');

    return (
        <Box>
            <Message variant="danger">
                <Trans id="errorBoundary.somethingWentWrong">
                    Es tut uns schrecklich leid aber es ist ein unerwarteter
                    Fehler aufgetreten. Bitte{' '}
                    <Link href={`mailto:${supportEmail}`} external>
                        kontaktieren Sie uns zur Behebung
                    </Link>
                    .
                </Trans>
            </Message>
        </Box>
    );
};
