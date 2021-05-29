// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import { queues } from 'apps/provider/actions';
import {
    submitToQueue,
    contactData,
    queueData,
    getToken,
} from 'apps/user/actions';
import {
    withSettings,
    withActions,
    withRouter,
    withForm,
    CardContent,
    CardFooter,
    ErrorFor,
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
                    form: { set, data, error, valid, reset },
                }) => {
                    const [initialized, setInitialized] = useState(false);
                    const [modified, setModified] = useState(false);
                    const [submitting, setSubmitting] = useState(false);
                    const [tv, setTV] = useState(0);
                    useEffect(() => {
                        if (initialized) return;
                        setInitialized(true);
                        contactDataAction();
                        queueDataAction().then(qd => {
                            reset(qd.data || {});
                        });
                    });

                    const submit = () => {
                        setSubmitting(true);
                        queuesAction(data.zip_code, data.radius).then(qd => {
                            if (qd.status === 'loaded' && qd.data.length > 0) {
                                submitToQueueAction(
                                    contactData.data,
                                    qd.data[0]
                                ).then(hd => {
                                    setSubmitting(false);
                                    router.navigateToUrl(
                                        '/user/setup/store-secrets'
                                    );
                                });
                            }
                        });
                        reset({ radius: 10 });
                    };

                    const setAndMarkModified = (key, value) => {
                        setModified(true);
                        set(key, value);
                    };

                    const render = () => {
                        return (
                            <React.Fragment>
                                <CardContent>
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
                                            htmlFor="radius"
                                        >
                                            <T t={t} k="contact-data.radius" />
                                        </label>
                                        <ErrorFor
                                            error={error}
                                            field="radius"
                                        />
                                        <RichSelect
                                            id="radius"
                                            value={data.radius || 10}
                                            onChange={value =>
                                                setAndMarkModified(
                                                    'radius',
                                                    value.value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: 10,
                                                    description: '10 Kilometer',
                                                },
                                                {
                                                    value: 20,
                                                    description: '20 Kilometer',
                                                },
                                            ]}
                                        />
                                        <h2>
                                            <T
                                                t={t}
                                                k="contact-data.vaccine-types"
                                            />
                                        </h2>
                                        <ul className="kip-properties">
                                            <li className="kip-property">
                                                <Switch
                                                    id="az"
                                                    onChange={() => false}
                                                >
                                                    &nbsp;
                                                </Switch>

                                                <label htmlFor="az">
                                                    <T
                                                        t={t}
                                                        k="contact-data.astrazeneca"
                                                    />
                                                </label>
                                            </li>
                                            <li className="kip-property">
                                                <Switch
                                                    id="az"
                                                    onChange={() => false}
                                                >
                                                    &nbsp;
                                                </Switch>

                                                <label htmlFor="az">
                                                    <T
                                                        t={t}
                                                        k="contact-data.biontech"
                                                    />
                                                </label>
                                            </li>
                                        </ul>
                                        <h2>
                                            <T
                                                t={t}
                                                k="contact-data.location"
                                            />
                                        </h2>
                                        <ul className="kip-properties">
                                            <li className="kip-property">
                                                <Switch
                                                    id="az"
                                                    onChange={() => false}
                                                >
                                                    &nbsp;
                                                </Switch>

                                                <label htmlFor="az">
                                                    <T
                                                        t={t}
                                                        k="contact-data.accessible"
                                                    />
                                                </label>
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        waiting={submitting}
                                        type="success"
                                        onClick={submit}
                                        disabled={submitting || !valid}
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
                    return <WithLoader resources={[]} renderLoaded={render} />;
                },
                [queues, submitToQueue, queueData, contactData]
            )
        )
    ),
    FinalizeForm,
    'form'
);

export default Finalize;
