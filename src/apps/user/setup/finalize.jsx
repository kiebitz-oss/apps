// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';
import {
    getToken,
    contactData,
    queueData,
    userSecret,
    backupData,
} from 'apps/user/actions';
import {
    withActions,
    withForm,
    CardContent,
    CardFooter,
    ErrorFor,
    Message,
    RetractingLabelInput,
    RichSelect,
    WithLoader,
    Switch,
    Button,
} from 'components';
import Form from 'helpers/form';
import { Trans, t, defineMessage } from '@lingui/macro';
import './finalize.scss';
import props from './properties.json';
import { useNavigate } from 'react-router';

const contactDataPropertiesMessages = {
    location: {
        title: defineMessage({
            id: 'contact-data.properties.location.title',
            message: 'Impfort',
        }),
        values: {
            accessible: defineMessage({
                id: 'contact-data.properties.location.values.accessible',
                message: 'Barrierefreier Impfort gewünscht',
            }),
        },
    },
};

class FinalizeForm extends Form {
    validate() {
        const errors = {};
        if (this.data.distance === undefined) this.data.distance = 5;
        if (!this.data.zipCode || this.data.zipCode.length != 5)
            errors.zipCode = t({
                id: 'contact-data.invalid-zip-code',
                message: 'Bitte trage eine gültige Postleitzahl ein.',
            });
        return errors;
    }
}

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const FinalizePage = ({
    queueData,
    queueDataAction,
    backupData,
    backupDataAction,
    contactData,
    contactDataAction,
    getToken,
    getTokenAction,
    userSecret,
    userSecretAction,
    form: { set, data, error, valid, reset },
}) => {
    const [initialized, setInitialized] = useState(false);
    const [noQueue, setNoQueue] = useState(false);
    const [modified, setModified] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [tv, setTV] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        contactDataAction();
        userSecretAction();
        getTokenAction.reset();
        queueDataAction().then(qd => {
            const initialData = {
                distance: 5,
            };
            for (const [k, v] of Object.entries(
                props['contact-data'].properties
            )) {
                for (const [kv, vv] of Object.entries(v.values)) {
                    initialData[kv] = vv._default;
                }
            }
            reset(qd.data || initialData);
        });
    });

    const submit = () => {
        setSubmitting(true);
        queueDataAction(data).then(() => {
            getTokenAction(contactData.data, userSecret.data).then(hd => {
                setSubmitting(false);
                if (hd.status === 'failed') return;

                backupDataAction(userSecret.data);
                navigate('/user/setup/store-secrets');
            });
        });
    };

    const setAndMarkModified = (key, value) => {
        setNoQueue(false);
        setModified(true);
        queueDataAction(set(key, value));
    };

    const properties = Object.entries(props['contact-data'].properties).map(
        ([k, v]) => {
            const items = Object.entries(v.values).map(([kv, vv]) => (
                <li key={kv}>
                    <Switch
                        id={kv}
                        checked={data[kv] || false}
                        onChange={value => setAndMarkModified(kv, value)}
                    >
                        &nbsp;
                    </Switch>

                    <label htmlFor={kv}>
                        <Trans
                            id={contactDataPropertiesMessages[k].values[kv]}
                        />
                    </label>
                </li>
            ));

            return (
                <F key={k}>
                    <h2>
                        <Trans id={contactDataPropertiesMessages[k].title} />
                    </h2>
                    <ul className="kip-properties">{items}</ul>
                </F>
            );
        }
    );

    const render = () => {
        let noQueueMessage;
        let failedMessage;
        let failed;

        if (noQueue)
            noQueueMessage = (
                <Message type="danger">
                    <Trans id="wizard.no-queue.notice">
                        Im gewählten Postleitzahlgebiet ist der Dienst noch
                        nicht verfügar. Sorry!
                    </Trans>
                </Message>
            );

        if (getToken !== undefined && getToken.status === 'failed') {
            failed = true;
            if (getToken.error.error.code === 401) {
                failedMessage = (
                    <Message type="danger">
                        <Trans id="wizard.failed.invalid-code">
                            Dein Zugangscode ist ungültig oder wurde bereits
                            benutzt. Du kannst sich nicht mehrfach registrieren.
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

        return (
            <>
                <CardContent>
                    {noQueueMessage}
                    {failedMessage}
                    <div className="kip-finalize-fields">
                        <ErrorFor error={error} field="zipCode" />
                        <RetractingLabelInput
                            value={data.zipCode || ''}
                            onChange={value =>
                                setAndMarkModified('zipCode', value)
                            }
                            label={
                                <Trans id="contact-data.zip-code">
                                    Postleitzahl Deines Wohnorts
                                </Trans>
                            }
                        />
                        <label className="kip-control-label" htmlFor="distance">
                            <Trans id="contact-data.distance.label">
                                Maximale Entfernung zum Impfort in Kilometern
                                (km)
                            </Trans>
                            <span className="kip-control-notice">
                                <Trans id="contact-data.distance.notice">
                                    Achtung: Du kannst den Radius derzeit nur 1x
                                    einstellen und nicht mehr ändern!
                                </Trans>
                            </span>
                        </label>
                        <ErrorFor error={error} field="distance" />
                        <RichSelect
                            id="distance"
                            value={data.distance || 5}
                            onChange={value =>
                                setAndMarkModified('distance', value.value)
                            }
                            options={[
                                {
                                    value: 5,
                                    description: t({
                                        id: 'contact-data.distance.option.5',
                                        message: '5 km',
                                    }),
                                },
                                {
                                    value: 10,
                                    description: t({
                                        id: 'contact-data.distance.option.10',
                                        message: '10 km',
                                    }),
                                },
                                {
                                    value: 20,
                                    description: t({
                                        id: 'contact-data.distance.option.20',
                                        message: '20 km',
                                    }),
                                },
                                {
                                    value: 30,
                                    description: t({
                                        id: 'contact-data.distance.option.30',
                                        message: '30 km',
                                    }),
                                },
                                {
                                    value: 40,
                                    description: t({
                                        id: 'contact-data.distance.option.40',
                                        message: '40 km',
                                    }),
                                },
                                {
                                    value: 50,
                                    description: t({
                                        id: 'contact-data.distance.option.50',
                                        message: '50 km',
                                    }),
                                },
                            ]}
                        />
                        {properties}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        waiting={submitting}
                        type={noQueue || failed ? 'danger' : 'success'}
                        onClick={submit}
                        disabled={submitting || !valid}
                    >
                        <Trans
                            id={
                                noQueue
                                    ? 'wizard.no-queue.title'
                                    : failed
                                    ? 'wizard.failed.title'
                                    : submitting
                                    ? 'wizard.please-wait'
                                    : 'wizard.continue'
                            }
                        >
                            {noQueue
                                ? 'Nicht verfügbar'
                                : failed
                                ? 'Fehlgeschlagen :/'
                                : submitting
                                ? 'Bitte warten...'
                                : 'Weiter'}
                        </Trans>
                    </Button>
                </CardFooter>
            </>
        );
    };

    return <WithLoader resources={[]} renderLoaded={render} />;
};

export default withForm(
    withActions(FinalizePage, [
        getToken,
        queueData,
        contactData,
        userSecret,
        backupData,
    ]),
    FinalizeForm,
    'form'
);
