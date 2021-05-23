// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { useState, useEffect } from 'react';
import Form from 'helpers/form';
import {
    withRouter,
    withSettings,
    withForm,
    withActions,
    WithLoader,
    Form as FormComponent,
    FieldSet,
    RetractingLabelInput,
    ErrorFor,
    T,
    CardFooter,
    CardContent,
    SubmitField,
    Button,
} from 'components';
import { QueueSelect } from './queue-select';
import {
    queues,
    keys,
    keyPairs,
    providerData,
    submitProviderData,
} from './actions';
import t from './translations.yml';
import './settings.scss';

class SettingsForm extends Form {
    validate() {
        const errors = {};
        const queues = this.data.queues || [];
        if (queues.length === 0)
            errors.queues = this.settings.t(
                t,
                'provider-data.please-add-one-queue'
            );
        if (!this.data.name || this.data.name.length < 2)
            errors.name = this.settings.t(t, 'provider-data.invalid-name');
        return errors;
    }
}

const Settings = withActions(
    withForm(
        withRouter(
            withSettings(
                ({
                    type,
                    settings,
                    keys,
                    keysAction,
                    keyPairs,
                    keyPairsAction,
                    providerData,
                    providerDataAction,
                    submitProviderData,
                    submitProviderDataAction,
                    queues,
                    queuesAction,
                    form: { set, data, error, valid, reset },
                    router,
                }) => {
                    const [modified, setModified] = useState(false);
                    const [submitting, setSubmitting] = useState(false);
                    const [initialized, setInitialized] = useState(false);

                    const onSubmit = () => {
                        if (!valid || submitting) return;

                        setSubmitting(true);

                        providerDataAction(data).then(pd => {
                            submitProviderDataAction(
                                pd.data,
                                keyPairs.data,
                                keys.data
                            ).then(() => {
                                setModified(false);
                                setSubmitting(false);
                            });
                        });
                    };

                    // we load all the resources we need
                    useEffect(() => {
                        if (initialized) return;

                        keyPairsAction();
                        keysAction();
                        queuesAction();
                        providerDataAction().then(pd => {
                            reset(pd.data.data);
                        });

                        setInitialized(true);
                        setModified(false);
                    });

                    const setAndMarkModified = (key, value) => {
                        setModified(true);
                        set(key, value);
                    };

                    const removeQueue = oldQueue => {
                        const queues = data.queues || [];
                        const newQueues = [];
                        for (const queue of queues) {
                            if (queue === oldQueue.id) continue;
                            newQueues.push(queue);
                        }
                        set('queues', newQueues);
                        setModified(true);
                    };

                    const addQueue = newQueue => {
                        const queues = data.queues || [];
                        for (const queue of queues) {
                            if (queue === newQueue.id) return;
                        }
                        queues.push(newQueue.id);
                        set('queues', queues);
                        setModified(true);
                    };

                    const render = () => {
                        const controls = (
                            <React.Fragment>
                                <ErrorFor error={error} field="queues" />
                                <QueueSelect
                                    queues={queues.data}
                                    existingQueues={data.queues}
                                    addQueue={addQueue}
                                    removeQueue={removeQueue}
                                />
                                <ErrorFor error={error} field="access_code" />
                                <RetractingLabelInput
                                    value={data.access_code || ''}
                                    onChange={value =>
                                        setAndMarkModified('access_code', value)
                                    }
                                    description={
                                        <T
                                            t={t}
                                            k="provider-data.access-code.description"
                                        />
                                    }
                                    label={
                                        <T
                                            t={t}
                                            k="provider-data.access-code.label"
                                        />
                                    }
                                />
                                <hr />
                                <ErrorFor error={error} field="name" />
                                <RetractingLabelInput
                                    value={data.name || ''}
                                    onChange={value =>
                                        setAndMarkModified('name', value)
                                    }
                                    label={<T t={t} k="provider-data.name" />}
                                />
                                <ErrorFor error={error} field="phone" />
                                <RetractingLabelInput
                                    value={data.phone || ''}
                                    onChange={value =>
                                        setAndMarkModified('phone', value)
                                    }
                                    label={<T t={t} k="provider-data.phone" />}
                                />
                                <ErrorFor error={error} field="street" />
                                <RetractingLabelInput
                                    value={data.street || ''}
                                    onChange={value =>
                                        setAndMarkModified('street', value)
                                    }
                                    label={<T t={t} k="provider-data.street" />}
                                />
                                <ErrorFor error={error} field="zip_code" />
                                <RetractingLabelInput
                                    value={data.zip_code || ''}
                                    onChange={value =>
                                        setAndMarkModified('zip_code', value)
                                    }
                                    label={
                                        <T t={t} k="provider-data.zip-code" />
                                    }
                                />
                                <ErrorFor error={error} field="city" />
                                <RetractingLabelInput
                                    value={data.city || ''}
                                    onChange={value =>
                                        setAndMarkModified('city', value)
                                    }
                                    label={<T t={t} k="provider-data.city" />}
                                />
                                <ErrorFor error={error} field="email" />
                                <RetractingLabelInput
                                    value={data.email || ''}
                                    onChange={value =>
                                        setAndMarkModified('email', value)
                                    }
                                    label={<T t={t} k="provider-data.email" />}
                                />
                            </React.Fragment>
                        );

                        return (
                            <React.Fragment>
                                <div className="kip-provider-data">
                                    <FormComponent onSubmit={onSubmit}>
                                        <FieldSet disabled={submitting}>
                                            {
                                                <React.Fragment>
                                                    <h2>
                                                        <T
                                                            t={t}
                                                            k="provider-data.title"
                                                        />
                                                    </h2>
                                                    <p>
                                                        <T
                                                            t={t}
                                                            k="provider-data.description"
                                                        />
                                                    </p>
                                                    {controls}
                                                    <SubmitField
                                                        disabled={
                                                            !valid || !modified
                                                        }
                                                        type={'success'}
                                                        onClick={onSubmit}
                                                        waiting={submitting}
                                                        title={
                                                            submitting ? (
                                                                <T
                                                                    t={t}
                                                                    k="provider-data.saving"
                                                                />
                                                            ) : (
                                                                <T
                                                                    t={t}
                                                                    k={
                                                                        'provider-data.submit'
                                                                    }
                                                                />
                                                            )
                                                        }
                                                    />
                                                    <hr />
                                                    <h2>
                                                        <T
                                                            t={t}
                                                            k="save-and-restore"
                                                        />
                                                    </h2>
                                                    <Button type="warning">
                                                        <T t={t} k="restore" />
                                                    </Button>
                                                    &nbsp;
                                                    <Button type="sucess">
                                                        <T t={t} k="save" />
                                                    </Button>
                                                </React.Fragment>
                                            }
                                        </FieldSet>
                                    </FormComponent>
                                </div>
                            </React.Fragment>
                        );
                    };

                    // we wait until all resources have been loaded before we display the form
                    return (
                        <WithLoader
                            resources={[keys, keyPairs, queues, providerData]}
                            renderLoaded={render}
                        />
                    );
                }
            )
        ),
        SettingsForm,
        'form'
    ),
    [keys, queues, providerData, keyPairs, submitProviderData]
);

export default Settings;
