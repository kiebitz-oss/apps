// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import {
    withSettings,
    withActions,
    withRouter,
    CardContent,
    CardFooter,
    WithLoader,
    Button,
    T,
    A,
} from 'components';
import Wizard from './wizard';
import { submitProviderData, providerData, keys, keyPairs } from '../actions';
import t from './translations.yml';
import './finalize.scss';

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Finalize = withSettings(
    withRouter(
        withActions(
            ({
                settings,
                router,
                keys,
                keysAction,
                keyPairs,
                keyPairsAction,
                providerData,
                providerDataAction,
                submitProviderData,
                submitProviderDataAction,
            }) => {
                const [initialized, setInitialized] = useState(false);
                const [submitting, setSubmitting] = useState(false);
                useEffect(() => {
                    if (initialized) return;
                    setInitialized(true);
                    keysAction();
                    keyPairsAction();
                    providerDataAction();
                });

                const submit = () => {
                    setSubmitting(true);
                    submitProviderDataAction(
                        providerData.data,
                        keyPairs.data,
                        keys.data
                    ).then(hd => {
                        setSubmitting(false);
                        router.navigateToUrl('/provider/setup/store-secrets');
                    });
                };

                const render = () => {
                    return (
                        <React.Fragment>
                            <CardContent>...</CardContent>
                            <CardFooter>
                                <Button
                                    waiting={submitting}
                                    type="success"
                                    onClick={submit}
                                    disabled={submitting}
                                >
                                    <T
                                        t={t}
                                        k={
                                            submitting
                                                ? 'wizard.please-wait'
                                                : 'wizard.continue'
                                        }
                                    />
                                </Button>
                            </CardFooter>
                        </React.Fragment>
                    );
                };
                return (
                    <WithLoader
                        resources={[keys, keyPairs, providerData]}
                        renderLoaded={render}
                    />
                );
            },
            [submitProviderData, providerData, keys, keyPairs]
        )
    )
);

export default Finalize;
