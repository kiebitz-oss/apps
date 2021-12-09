import React from 'react';
import { t, Trans } from '@lingui/macro';
import { Box, BoxContent, BoxFooter, BoxHeader, Link, Title } from 'ui';

const StepHiBase: React.FC = () => (
    <Box>
        <BoxHeader>
            <Title>
                <Trans id="wizard.steps.hi">Los geht's!</Trans>
            </Title>
        </BoxHeader>

        <BoxContent>
            <p>
                <Trans id="wizard.hi">
                    Willkommen. Dieser Assistent hilft Dir bei der
                    Impfanmeldung.
                </Trans>
            </p>
        </BoxContent>

        <BoxFooter>
            <Link
                type="button"
                variant="primary"
                href={`/user/setup/enter-contact-data`}
            >
                <Trans id="wizard.continue">Weiter</Trans>
            </Link>
        </BoxFooter>
    </Box>
);

export const StepHi = Object.assign(StepHiBase, {
    step: 'hi',
    title: t({
        id: 'wizard.steps.hi',
        message: "Los geht's!",
    }),
});
