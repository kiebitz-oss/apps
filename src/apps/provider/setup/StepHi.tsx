import React from 'react';
import { Trans } from '@lingui/macro';
import { Box, BoxContent, BoxFooter, BoxHeader, Link, Title } from 'ui';

const StepHiBase: React.FC = () => {
    return (
        <Box>
            <BoxHeader>
                <Title>
                    <Trans id="wizard.steps.hi">Hi</Trans>
                </Title>
            </BoxHeader>

            <BoxContent>
                <p>
                    <Trans id="wizard.provider.hi">
                        Willkommen. Dieser Assistent führt Sie Schritt für
                        Schritt zur Terminverwaltung.
                    </Trans>
                </p>
            </BoxContent>

            <BoxFooter>
                <Link
                    variant="success"
                    type="button"
                    href={`/provider/setup/enter-provider-data`}
                >
                    <Trans id="wizard.continue">Weiter</Trans>
                </Link>
            </BoxFooter>
        </Box>
    );
};

export const StepHi = Object.assign(StepHiBase, {
    step: 'hi',
});
