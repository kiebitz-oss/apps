// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState, Fragment as F } from 'react';
import {
    withSettings,
    withActions,
    withRouter,
    Modal,
    Message,
    CardContent,
    WithLoader,
    CardFooter,
    Button,
    Switch,
    T,
    A,
} from 'components';
import Wizard from './wizard';
import classNames from 'helpers/classnames';
import { submitProviderData, providerData, keyPairs, keys } from '../actions';

import { Trans } from '@lingui/macro';
import './verify.scss';

export const ProviderData = ({ providerData, changeHref, verified }) => {
    let data;
    if (verified) {
        if (providerData.data === null)
            return (
                <F>
                    <p>
                        <Trans id="provider-data.not-verified-yet" />
                    </p>
                </F>
            );
        data = providerData.data.signedData.json;
    } else data = providerData.data.data;
    return (
        <F>
            <div
                className={classNames('kip-provider-data', 'kip-is-box', {
                    'kip-is-verified': verified,
                })}
            >
                <ul>
                    <li>
                        <span>
                            <Trans id="provider-data.name" />
                        </span>{' '}
                        {data.name}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.street" />
                        </span>{' '}
                        {data.street}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.zip-code" /> &
                            <Trans id="provider-data.city" />
                        </span>{' '}
                        {data.zipCode} - &nbsp;
                        {data.city}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.website" />
                        </span>{' '}
                        {data.website}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.description" />
                        </span>{' '}
                        {data.description || (
                            <Trans id="provider-data.not-given" />
                        )}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.phone" />
                        </span>{' '}
                        {data.phone || <Trans id="provider-data.not-given" />}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.email" />
                        </span>{' '}
                        {data.email || <Trans id="provider-data.not-given" />}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.access-code.label" />
                        </span>{' '}
                        {data.code || <Trans id="provider-data.not-given" />}
                    </li>
                </ul>
                <hr />
                <ul className="kip-properties">
                    <li className="kip-property">
                        <Switch
                            id="accessible"
                            checked={data.accessible || false}
                            onChange={() => false}
                        >
                            &nbsp;
                        </Switch>

                        <label htmlFor="accessible">
                            <Trans id="provider-data.accessible" />
                        </label>
                    </li>
                </ul>
            </div>
            <div className="kip-provider-data-links">
                <A
                    className="bulma-button bulma-is-small"
                    href={changeHref || '/provider/setup/enter-provider-data'}
                >
                    <Trans id="provider-data.change" />
                </A>
            </div>
        </F>
    );
};

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
                    submitProviderDataAction.reset();
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
                    ).then(pd => {
                        setSubmitting(false);
                        if (pd.status === 'succeeded')
                            router.navigateToUrl(
                                '/provider/setup/store-secrets'
                            );
                    });
                };

                let failedMessage;
                let failed;

                if (
                    submitProviderData !== undefined &&
                    submitProviderData.status === 'failed'
                ) {
                    failed = true;
                    if (
                        submitProviderData.error.error !== undefined &&
                        submitProviderData.error.error.code === 401
                    ) {
                        failedMessage = (
                            <Message type="danger">
                                <Trans id="wizard.failed.invalid-code" />
                            </Message>
                        );
                    }
                }

                if (failed && !failedMessage)
                    failedMessage = (
                        <Message type="danger">
                            <Trans id="wizard.failed.notice" />
                        </Message>
                    );

                const render = () => (
                    <React.Fragment>
                        <CardContent>
                            {failedMessage}
                            <p className="kip-verify-notice">
                                <Trans id="verify.text"
                                    link={
                                        <A
                                            key="letUsKnow"
                                            external
                                            href={settings.get('supportEmail')}
                                        >
                                            <Trans
                                                id="wizard.letUsKnow"
                                                key="letUsKnow"
                                            />
                                        </A>
                                    }
                                />
                            </p>
                            <ProviderData providerData={providerData || {}} />
                        </CardContent>
                        <CardFooter>
                            <Button
                                type={failed ? 'danger' : 'success'}
                                disabled={submitting}
                                onClick={submit}
                            >
                                <Trans id={
                                        failed
                                            ? 'wizard.failed.title'
                                            : submitting
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
                        resources={[providerData, keyPairs]}
                        renderLoaded={render}
                    />
                );
            },
            [submitProviderData, providerData, keys, keyPairs]
        )
    )
);

export default Verify;
