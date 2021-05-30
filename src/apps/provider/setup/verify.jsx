// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import {
    withSettings,
    withActions,
    withRouter,
    Modal,
    CardContent,
    WithLoader,
    CardFooter,
    Button,
    T,
    A,
} from 'components';
import Wizard from './wizard';
import { submitProviderData, providerData, keyPairs, keys } from '../actions';

import t from './translations.yml';
import './verify.scss';

/*
Here the user has a chance to review all data that was entered before confirming
the setup. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Verify = withRouter(
    withSettings(
        withActions(
            ({
                router,
                settings,
                providerData,
                submitProviderData,
                submitProviderDataAction,
                keyPairsAction,
                keysAction,
                keys,
                keyPairs,
                providerDataAction,
            }) => {
                const [initialized, setInitialized] = useState(false);
                const [submitting, setSubmitting] = useState(false);

                useEffect(() => {
                    if (initialized) return;
                    providerDataAction();
                    keyPairsAction();
                    keysAction();
                    setInitialized(true);
                });

                const submit = () => {
                    if (submitting) return;

                    setSubmitting(true);

                    submitProviderDataAction(
                        providerData.data,
                        keyPairs.data,
                        keys.data
                    ).then(() => {
                        setSubmitting(false);
                        router.navigateToUrl('/provider/setup/store-secrets');
                    });
                };

                const render = () => (
                    <React.Fragment>
                        <CardContent>
                            <p className="kip-verify-notice">
                                <T
                                    t={t}
                                    k="verify.text"
                                    link={
                                        <A
                                            key="letUsKnow"
                                            external
                                            href={settings.get('supportEmail')}
                                        >
                                            <T
                                                t={t}
                                                k="wizard.letUsKnow"
                                                key="letUsKnow"
                                            />
                                        </A>
                                    }
                                />
                            </p>
                            <div className="kip-provider-data-box">
                                <ul>
                                    <li>
                                        <span>
                                            <T t={t} k="provider-data.name" />
                                        </span>{' '}
                                        {providerData.data.name}
                                    </li>
                                    <li>
                                        <span>
                                            <T t={t} k="provider-data.email" />
                                        </span>{' '}
                                        {providerData.data.email || (
                                            <T
                                                t={t}
                                                k="provider-data.not-given"
                                            />
                                        )}
                                    </li>
                                </ul>
                            </div>
                            <div className="kip-provider-data-links">
                                <A
                                    className="bulma-button bulma-is-small"
                                    href="/provider/setup/enter-provider-data"
                                >
                                    <T t={t} k="provider-data.change" />
                                </A>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="success"
                                disabled={submitting}
                                onClick={submit}
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
                return (
                    <WithLoader
                        resources={[providerData, keyPairs, keys]}
                        renderLoaded={render}
                    />
                );
            },
            [submitProviderData, providerData, keys, keyPairs]
        )
    )
);

export default Verify;
