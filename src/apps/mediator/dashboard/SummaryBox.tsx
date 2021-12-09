// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Box, BoxHeader, BoxContent, Title } from 'ui';
import { Trans } from '@lingui/macro';

const formatNumbers = (n: number) => n;

interface SummaryBoxProps {
    open: number;
    booked: number;
    active: number;
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({
    open,
    booked,
    active,
}) => (
    <Box>
        <BoxHeader>
            <Title>
                <Trans id="summary">Überblick</Trans>
            </Title>
        </BoxHeader>

        <BoxContent>
            <p>
                <span>{formatNumbers(open)}</span>
                <Trans id="open">Offene Termine</Trans>
            </p>

            <p>
                <span>{formatNumbers(booked)}</span>
                <Trans id="booked">Gebuchte Termine</Trans>
            </p>

            <p>
                <span>{formatNumbers(active)}</span>
                <Trans id="active">Aktive Anbieter</Trans>
            </p>
        </BoxContent>
    </Box>
);
