// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import {
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
import { Status } from 'vanellus';
import { useProvider, useRouter, useSettings } from 'hooks';
import classNames from 'helpers/classnames';

import t from './translations.yml';
import './verify.scss';

export const ProviderData = ({ changeHref, verified }) => {
    const provider = useProvider({ name: 'main', attributes: ['data'] });

    let data;
    if (verified) {
        if (provider.data === null)
            return (
                <p>
                    <T t={t} k="provider-data.not-verified-yet" />
                </p>
            );
        data = provider.verifiedData;
    } else data = provider.data;
    return (
        <>
            <div
                className={classNames('kip-provider-data', 'kip-is-box', {
                    'kip-is-verified': verified,
                })}
            >
                <ul>
                    <li>
                        <span>
                            <T t={t} k="provider-data.name" />
                        </span>{' '}
                        {data.name}
                    </li>
                    <li>
                        <span>
                            <T t={t} k="provider-data.street" />
                        </span>{' '}
                        {data.street}
                    </li>
                    <li>
                        <span>
                            <T t={t} k="provider-data.zip-code" /> &
                            <T t={t} k="provider-data.city" />
                        </span>{' '}
                        {data.zipCode} - &nbsp;
                        {data.city}
                    </li>
                    <li>
                        <span>
                            <T t={t} k="provider-data.website" />
                        </span>{' '}
                        {data.website}
                    </li>
                    <li>
                        <span>
                            <T t={t} k="provider-data.description" />
                        </span>{' '}
                        {data.description || (
                            <T t={t} k="provider-data.not-given" />
                        )}
                    </li>
                    <li>
                        <span>
                            <T t={t} k="provider-data.phone" />
                        </span>{' '}
                        {data.phone || <T t={t} k="provider-data.not-given" />}
                    </li>
                    <li>
                        <span>
                            <T t={t} k="provider-data.email" />
                        </span>{' '}
                        {data.email || <T t={t} k="provider-data.not-given" />}
                    </li>
                    <li>
                        <span>
                            <T t={t} k="provider-data.access-code.label" />
                        </span>{' '}
                        {data.code || <T t={t} k="provider-data.not-given" />}
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
                            <T t={t} k="provider-data.accessible" />
                        </label>
                    </li>
                </ul>
            </div>
            <div className="kip-provider-data-links">
                <A
                    className="bulma-button bulma-is-small"
                    href={changeHref || '/provider/setup/enter-provider-data'}
                >
                    <T t={t} k="provider-data.change" />
                </A>
            </div>
        </>
    );
};

const Verify = () => {
    const router = useRouter();
    const settings = useSettings();
    const provider = useProvider();

    const [submitting, setSubmitting] = useState(false);
    const [response, setResponse] = useState(null);

    const submit = async () => {
        if (submitting) return;

        setSubmitting(true);
        const response = await provider.storeData();
        setSubmitting(false);

        setResponse(response);

        if (response.status === Status.Succeeded)
            router.navigateToUrl('/provider/setup/store-secrets');
    };

    let failedMessage;
    let failed;

    if (response && response.status === Status.Failed) {
        console.log(response);
        failed = true;
        if (
            response.error.error !== undefined &&
            response.error.error.code === 401
        ) {
            failedMessage = (
                <Message type="danger">
                    <T t={t} k="wizard.failed.invalid-code" />
                </Message>
            );
        }
    }

    if (failed && !failedMessage)
        failedMessage = (
            <Message type="danger">
                <T t={t} k="wizard.failed.notice" />
            </Message>
        );

    return (
        <>
            <CardContent>
                {failedMessage}
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
                                <T t={t} k="wizard.letUsKnow" key="letUsKnow" />
                            </A>
                        }
                    />
                </p>
                <ProviderData />
            </CardContent>
            <CardFooter>
                <Button
                    type={failed ? 'danger' : 'success'}
                    disabled={submitting}
                    onClick={submit}
                >
                    <T
                        t={t}
                        k={
                            failed
                                ? 'wizard.failed.title'
                                : submitting
                                ? 'wizard.please-wait'
                                : 'wizard.continue'
                        }
                    />
                </Button>
            </CardFooter>
        </>
    );
};

export default Verify;
