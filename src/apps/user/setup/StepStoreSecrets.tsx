// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { withActions } from 'components';
import { userSecret } from 'apps/user/actions';
import { Trans } from '@lingui/macro';
import { Box, BoxContent, BoxFooter, BoxHeader, Link, Title } from 'ui';
import { DataSecret } from 'apps/common/DataSecret';

const StepStoreSecretsBase: React.FC<any> = ({ userSecret }) => {
    return (
        <Box>
            <BoxHeader>
                <Title>
                    <Trans id="wizard.steps.store-secrets">
                        Sicherheitscode notieren
                    </Trans>
                </Title>
            </BoxHeader>

            <BoxContent>
                <Trans id="store-secrets.online.text">
                    Bitte notiere Dir Deinen vertraulichen Sicherheitscode.
                    Alternativ kannst Du auch ein Bildschirmfoto machen. Bitte
                    beachte, dass Dir der Code NICHT per E-Mail geschickt wird
                    und er von uns auch NICHT wiederhergestellt werden kann.
                    <br />
                    <br />
                    <strong>
                        Du benötigst den Code, wenn Du Dich auf einem anderen
                        Endgerät (Tablet, Smartphone, Laptop etc.) einloggen und
                        Deinen gebuchten Termin einsehen oder ändern willst.
                    </strong>
                </Trans>

                <DataSecret secret={userSecret?.data} />
            </BoxContent>

            <BoxFooter>
                <Link
                    type="button"
                    variant="primary"
                    href={`/user/appointments`}
                >
                    <Trans id="wizard.leave">Zu den verfügbaren Terminen</Trans>
                </Link>
            </BoxFooter>
        </Box>
    );
};

export const StepStoreSecrets = Object.assign(
    withActions(StepStoreSecretsBase, [userSecret]),
    {
        step: 'store-secrets',
    }
);
