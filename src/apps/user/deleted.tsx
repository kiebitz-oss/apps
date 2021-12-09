// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Message, Box, BoxHeader, Title } from 'ui';
import { Trans } from '@lingui/macro';
import { useServiceName } from 'hooks/useServiceName';

const DeletedPage: React.FC = () => {
    const serviceName = useServiceName();

    return (
        <Box>
            <BoxHeader>
                <Title>
                    <Trans id="data-deleted">Daten erfolgreich gelöscht</Trans>
                </Title>
            </BoxHeader>

            <Message variant="success">
                <Trans id="thanks-for-using-us">
                    Deine Daten wurden erfolgreich gelöscht. Vielen Dank, dass
                    Du <strong key="service">{serviceName}</strong> genutzt
                    hast!
                </Trans>
            </Message>
        </Box>
    );
};

export default DeletedPage;
