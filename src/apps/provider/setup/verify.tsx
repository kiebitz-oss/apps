// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';
import {
    withActions,
    Message,
    CardContent,
    WithLoader,
    CardFooter,
    Button,
    Switch,
    A,
} from 'components';
import classNames from 'helpers/classnames';
import { submitProviderData, providerData, keyPairs, keys } from '../actions';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router';
import './verify.scss';

export const ProviderData: React.FC<any> = ({
    providerData,
    changeHref,
    verified,
}) => {
    let data;
    if (verified) {
        if (providerData.data === null)
            return (
                <>
                    <p>
                        <Trans id="provider-data.not-verified-yet">
                            Ihre Daten wurden noch nicht verifiziert. Bitte
                            haben Sie Verständnis, dass die Verifizierung bis zu
                            48h dauern kann.
                        </Trans>
                    </p>
                </>
            );
        data = providerData.data.signedData.json;
    } else data = providerData.data.data;
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
                            <Trans id="provider-data.name">
                                Vollständiger Name
                            </Trans>
                        </span>{' '}
                        {data.name}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.street">
                                Straße & Hausnummer
                            </Trans>
                        </span>{' '}
                        {data.street}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.zip-code">
                                Postleitzahl
                            </Trans>{' '}
                            &<Trans id="provider-data.city">Ort</Trans>
                        </span>{' '}
                        {data.zipCode} - &nbsp;
                        {data.city}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.website">Webseite</Trans>
                        </span>{' '}
                        {data.website}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.description">
                                Informationen für Impfwillige (z.B. wenn Sie
                                spezielle Impfstoffe nur bestimmten Gruppen
                                empfehlen)
                            </Trans>
                        </span>{' '}
                        {data.description || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.phone">
                                Telefonnummer (nicht sichtbar für
                                Impfinteressierte)
                            </Trans>
                        </span>{' '}
                        {data.phone || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.email" />
                        </span>{' '}
                        {data.email || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
                    </li>
                    <li>
                        <span>
                            <Trans id="provider-data.access-code.label">
                                Zugangscode (falls vorhanden)
                            </Trans>
                        </span>{' '}
                        {data.code || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
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
                            <Trans id="provider-data.accessible">
                                Barrierefreier Zugang zur Praxis/zum Impfzentrum
                            </Trans>
                        </label>
                    </li>
                </ul>
            </div>
            <div className="kip-provider-data-links">
                <A
                    className="bulma-button bulma-is-small"
                    href={changeHref || '/provider/setup/enter-provider-data'}
                >
                    <Trans id="provider-data.change">Anpassen</Trans>
                </A>
            </div>
        </>
    );
};

/*
Here the user has a chance to review all data that was entered before confirming
the setup. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const VerifyPage: React.FC<any> = ({
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
    const navigate = useNavigate();

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
        ).then((pd) => {
            setSubmitting(false);
            if (pd.status === 'succeeded')
                navigate('/provider/setup/store-secrets');
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
                    <Trans id="wizard.failed.invalid-code">
                        Ihr Zugangscode ist leider ungültig.
                    </Trans>
                </Message>
            );
        }
    }

    if (failed && !failedMessage)
        failedMessage = (
            <Message type="danger">
                <Trans id="wizard.failed.notice">
                    Sorry, hier ist etwas schief gelaufen. Bitte versuche es
                    später erneut.
                </Trans>
            </Message>
        );

    const render = () => (
        <React.Fragment>
            <CardContent>
                {failedMessage}
                <p className="kip-verify-notice">
                    <Trans id="verify.text">
                        Bitte überprüfen Sie Ihre Daten, bevor Sie den Vorgang
                        abschließen.
                    </Trans>
                </p>
                <ProviderData providerData={providerData || {}} />
            </CardContent>
            <CardFooter>
                <Button
                    type={failed ? 'danger' : 'success'}
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
            </CardFooter>
        </React.Fragment>
    );
    return (
        <WithLoader
            resources={[providerData, keyPairs]}
            renderLoaded={render}
        />
    );
};

export default withActions(VerifyPage, [
    submitProviderData,
    providerData,
    keys,
    keyPairs,
]);
