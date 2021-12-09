// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { withActions, WithLoader } from 'components';
import {
    Message,
    BoxContent,
    BoxFooter,
    Button,
    Box,
    BoxHeader,
    Title,
    Link,
} from 'ui';
import {
    submitProviderData,
    providerData,
    keyPairs,
    keys,
} from 'apps/provider/actions';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router';
import { useEffectOnce } from 'react-use';
import { ProviderDataSummary } from 'apps/provider/common/ProviderDataSummary';

/*
Here the user has a chance to review all data that was entered before confirming
the setup. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const StepVerifyBase: React.FC<any> = ({
    providerData,
    submitProviderData,
    submitProviderDataAction,
    keyPairsAction,
    keysAction,
    keys,
    keyPairs,
    providerDataAction,
}) => {
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffectOnce(() => {
        providerDataAction();
        submitProviderDataAction.reset();
        keyPairsAction();
        keysAction();
    });

    const submit = () => {
        if (submitting) return;

        setSubmitting(true);

        submitProviderDataAction(
            providerData.data,
            keyPairs.data,
            keys.data
        ).then((pd: any) => {
            if (pd.status === 'succeeded')
                navigate('/provider/setup/store-secrets');
        });
    };

    const failed = submitProviderData?.status === 'failed';

    const render = () => (
        <>
            <BoxContent>
                {failed && submitProviderData?.error?.error?.code === 401 && (
                    <Message variant="danger">
                        <Trans id="wizard.failed.invalid-code">
                            Ihr Zugangscode ist leider ungültig.
                        </Trans>
                    </Message>
                )}

                {failed && submitProviderData?.error?.error?.code !== 401 && (
                    <Message variant="danger">
                        <Trans id="wizard.failed.notice">
                            Sorry, hier ist etwas schief gelaufen. Bitte
                            versuche es später erneut.
                        </Trans>
                    </Message>
                )}

                <ProviderDataSummary providerData={providerData || {}} />
            </BoxContent>

            <BoxFooter className="flex justify-between">
                <Link
                    href="/provider/setup/enter-provider-data"
                    type="button"
                    variant="secondary"
                >
                    <Trans id="provider-data.change">Anpassen</Trans>
                </Link>

                <Button
                    variant={failed ? 'danger' : 'success'}
                    disabled={submitting}
                    onClick={submit}
                >
                    <Trans
                        id={
                            failed
                                ? 'wizard.failed.title'
                                : submitting
                                ? 'wizard.please-wait'
                                : 'wizard.continue'
                        }
                    >
                        {failed
                            ? 'Fehlgeschlagen'
                            : submitting
                            ? 'Bitte warten...'
                            : 'Weiter'}
                    </Trans>
                </Button>
            </BoxFooter>
        </>
    );
    return (
        <Box>
            <BoxHeader>
                <Title>Missing title</Title>
            </BoxHeader>
            <WithLoader
                resources={[providerData, keyPairs]}
                renderLoaded={render}
            />
        </Box>
    );
};

export const StepVerify = Object.assign(
    withActions(StepVerifyBase, [
        submitProviderData,
        providerData,
        keys,
        keyPairs,
    ]),
    { step: 'verify' }
);
