// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState, Fragment as F } from 'react';
import { queues } from 'apps/provider/actions';
import {
    submitToQueue,
    contactData,
    queueData,
    getToken,
    userSecret,
} from 'apps/user/actions';
import {
    withSettings,
    withActions,
    withRouter,
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
    T,
    A,
} from 'components';
import Form from 'helpers/form';
import Wizard from './wizard';
import t from './translations.yml';
import './finalize.scss';

class FinalizeForm extends Form {
    validate() {
        const errors = {};
        if (!this.data.zip_code || this.data.zip_code.length != 5)
            errors.zip_code = this.settings.t(
                t,
                'contact-data.invalid-zip-code'
            );
        return errors;
    }
}

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Finalize = withForm(
    withSettings(
        withRouter(
            withActions(
                ({
                    settings,
                    router,
                    queues,
                    queuesAction,
                    queueData,
                    queueDataAction,
                    contactData,
                    contactDataAction,
                    submitToQueue,
                    submitToQueueAction,
                    userSecret,
                    userSecretAction,
                    form: { set, data, error, valid, reset },
                }) => {
                    const [initialized, setInitialized] = useState(false);
                    const [noQueue, setNoQueue] = useState(false);
                    const [modified, setModified] = useState(false);
                    const [submitting, setSubmitting] = useState(false);
                    const [tv, setTV] = useState(0);
                    useEffect(() => {
                        if (initialized) return;
                        setInitialized(true);
                        contactDataAction();
                        userSecretAction();
                        queueDataAction().then(qd => {
                            const initialData = {
                                distance: 50,
                            };
                            for (const [k, v] of Object.entries(
                                t['contact-data'].properties
                            )) {
                                for (const [kv, vv] of Object.entries(
                                    v.values
                                )) {
                                    initialData[kv] = vv._default;
                                }
                            }
                            reset(qd.data || initialData);
                        });
                    });

                    const submit = () => {
                        setSubmitting(true);
                        queueDataAction(data).then(({ data: sd }) => {
                            const qa = queuesAction(sd.zip_code, sd.distance);
                            qa.then(qd => {
                                if (qd.data.length === 0) {
                                    setNoQueue(true);
                                    setSubmitting(false);
                                    return;
                                }
                                submitToQueueAction(
                                    contactData.data,
                                    sd,
                                    qd.data[0],
                                    userSecret.data
                                ).then(hd => {
                                    setSubmitting(false);
                                    router.navigateToUrl(
                                        '/user/setup/store-secrets'
                                    );
                                });
                            });
                        });
                    };

                    const setAndMarkModified = (key, value) => {
                        setNoQueue(false);
                        setModified(true);
                        queueDataAction(set(key, value));
                    };

                    const properties = Object.entries(
                        t['contact-data'].properties
                    ).map(([k, v]) => {
                        const items = Object.entries(v.values).map(
                            ([kv, vv]) => (
                                <li key={kv}>
                                    <Switch
                                        id={kv}
                                        checked={data[kv] || false}
                                        onChange={value =>
                                            setAndMarkModified(kv, value)
                                        }
                                    >
                                        &nbsp;
                                    </Switch>

                                    <label htmlFor={kv}>
                                        <T
                                            t={t}
                                            k={`contact-data.properties.${k}.values.${kv}`}
                                        />
                                    </label>
                                </li>
                            )
                        );

                        return (
                            <F key={k}>
                                <h2>
                                    <T
                                        t={t}
                                        k={`contact-data.properties.${k}.title`}
                                    />
                                </h2>
                                <ul className="kip-properties">{items}</ul>
                            </F>
                        );
                    });

                    const render = () => {
                        let noQueueMessage;

                        if (noQueue)
                            noQueueMessage = (
                                <Message type="danger">
                                    <T t={t} k="no-queue" />
                                </Message>
                            );

                        return (
                            <React.Fragment>
                                <CardContent>
                                    {noQueueMessage}
                                    <div className="kip-finalize-fields">
                                        <ErrorFor
                                            error={error}
                                            field="zip_code"
                                        />
                                        <RetractingLabelInput
                                            value={data.zip_code || ''}
                                            onChange={value =>
                                                setAndMarkModified(
                                                    'zip_code',
                                                    value
                                                )
                                            }
                                            label={
                                                <T
                                                    t={t}
                                                    k="contact-data.zip-code"
                                                />
                                            }
                                        />
                                        <label
                                            className="kip-control-label"
                                            htmlFor="distance"
                                        >
                                            <T
                                                t={t}
                                                k="contact-data.distance.label"
                                            />
                                            <span className="kip-control-notice">
                                                <T
                                                    t={t}
                                                    k="contact-data.distance.notice"
                                                />
                                            </span>
                                        </label>
                                        <ErrorFor
                                            error={error}
                                            field="distance"
                                        />
                                        <RichSelect
                                            id="distance"
                                            value={data.distance || 10}
                                            onChange={value =>
                                                setAndMarkModified(
                                                    'distance',
                                                    value.value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: 10,
                                                    description: (
                                                        <T
                                                            t={t}
                                                            k="contact-data.distance.option"
                                                            distance={10}
                                                        />
                                                    ),
                                                },
                                                {
                                                    value: 20,
                                                    description: (
                                                        <T
                                                            t={t}
                                                            k="contact-data.distance.option"
                                                            distance={20}
                                                        />
                                                    ),
                                                },
                                                {
                                                    value: 30,
                                                    description: (
                                                        <T
                                                            t={t}
                                                            k="contact-data.distance.option"
                                                            distance={30}
                                                        />
                                                    ),
                                                },
                                                {
                                                    value: 40,
                                                    description: (
                                                        <T
                                                            t={t}
                                                            k="contact-data.distance.option"
                                                            distance={40}
                                                        />
                                                    ),
                                                },
                                                {
                                                    value: 50,
                                                    description: (
                                                        <T
                                                            t={t}
                                                            k="contact-data.distance.option"
                                                            distance={50}
                                                        />
                                                    ),
                                                },
                                            ]}
                                        />
                                        {properties}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        waiting={submitting}
                                        type={noQueue ? 'danger' : 'success'}
                                        onClick={submit}
                                        disabled={submitting || !valid}
                                    >
                                        <T
                                            t={t}
                                            k={
                                                noQueue
                                                    ? 'wizard.no-queue'
                                                    : submitting
                                                    ? 'wizard.please-wait'
                                                    : 'wizard.continue'
                                            }
                                        />
                                    </Button>
                                </CardFooter>
                            </React.Fragment>
                        );
                    };
                    return <WithLoader resources={[]} renderLoaded={render} />;
                },
                [queues, submitToQueue, queueData, contactData, userSecret]
            )
        )
    ),
    FinalizeForm,
    'form'
);

export default Finalize;
