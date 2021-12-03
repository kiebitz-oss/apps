import React from 'react';
import { Trans } from '@lingui/macro';
import { CardContent, CardFooter, A } from 'components';

export const StepHi: React.FC<any> = () => (
    <>
        <CardContent>
            <p>
                <Trans id="wizard.hi">
                    Willkommen. Dieser Assistent hilft Dir bei der
                    Impfanmeldung.
                </Trans>
            </p>
        </CardContent>

        <CardFooter>
            <A
                type="button"
                variant="success"
                href={`/user/setup/enter-contact-data`}
            >
                <Trans id="wizard.continue">Weiter</Trans>
            </A>
        </CardFooter>
    </>
);
