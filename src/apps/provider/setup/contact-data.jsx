// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import { QueueSelect } from '../dashboard/queue-select';
import Form from 'helpers/form';
import { contactData, queues, keyPairs, providerData } from '../actions';
import {
    withRouter,
    withForm,
    withActions,
    Form as FormComponent,
    FieldSet,
    RetractingLabelInput,
    ErrorFor,
    T,
    CardFooter,
    CardContent,
    WithLoader,
    SubmitField,
    Button,
} from 'components';
import t from './translations.yml';
import './contact-data.scss';

class ContactDataForm extends Form {
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

const BaseContactData = ({
    queues,
    queuesAction,
    keyPairs,
    keyPairsAction,
    providerData,
    providerDataAction,
    embedded,
    form: { set, data, error, valid, reset },
    router,
}) => {
    const [modified, setModified] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const onSubmit = () => {
        if (!valid) return;
        providerDataAction(data);
        // we redirect to the 'verify' step
        router.navigateToUrl(`/provider/setup/verify`);
    };

    useEffect(() => {
        if (initialized) return;
        keyPairsAction();
        queuesAction();
        providerDataAction().then(pd => {
            reset(pd.data.data);
        });
        setInitialized(true);
        setModified(false);
    });

    const submitting = false;

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

    const controls = (
        <React.Fragment>
            <ErrorFor error={error} field="name" />
            <RetractingLabelInput
                value={data.name || ''}
                onChange={value => setAndMarkModified('name', value)}
                label={<T t={t} k="contact-data.name" />}
            />
            <h2>
                <T t={t} k="contact-data.optional.title" />
            </h2>
            <ErrorFor error={error} field="email" />
            <RetractingLabelInput
                value={data.email || ''}
                onChange={value => setAndMarkModified('email', value)}
                label={<T t={t} k="contact-data.email" />}
            />
        </React.Fragment>
    );

    const redirecting = false;

    console.log(queues);

    const render = () => {
        const controls = (
            <React.Fragment>
                <ErrorFor error={error} field="queues" />
                <QueueSelect
                    queues={queues.data}
                    existingQueues={data.queues || []}
                    addQueue={addQueue}
                    key="qs"
                    removeQueue={removeQueue}
                />
                <ErrorFor error={error} field="access_code" />
                <RetractingLabelInput
                    value={data.access_code || ''}
                    onChange={value => setAndMarkModified('access_code', value)}
                    description={
                        <T t={t} k="provider-data.access-code.description" />
                    }
                    label={<T t={t} k="provider-data.access-code.label" />}
                />
                <hr />
                <ErrorFor error={error} field="name" />
                <RetractingLabelInput
                    value={data.name || ''}
                    onChange={value => setAndMarkModified('name', value)}
                    label={<T t={t} k="provider-data.name" />}
                />
                <ErrorFor error={error} field="phone" />
                <RetractingLabelInput
                    value={data.phone || ''}
                    onChange={value => setAndMarkModified('phone', value)}
                    label={<T t={t} k="provider-data.phone" />}
                />
                <ErrorFor error={error} field="street" />
                <RetractingLabelInput
                    value={data.street || ''}
                    onChange={value => setAndMarkModified('street', value)}
                    label={<T t={t} k="provider-data.street" />}
                />
                <ErrorFor error={error} field="zip_code" />
                <RetractingLabelInput
                    value={data.zip_code || ''}
                    onChange={value => setAndMarkModified('zip_code', value)}
                    label={<T t={t} k="provider-data.zip-code" />}
                />
                <ErrorFor error={error} field="city" />
                <RetractingLabelInput
                    value={data.city || ''}
                    onChange={value => setAndMarkModified('city', value)}
                    label={<T t={t} k="provider-data.city" />}
                />
                <ErrorFor error={error} field="email" />
                <RetractingLabelInput
                    value={data.email || ''}
                    onChange={value => setAndMarkModified('email', value)}
                    label={<T t={t} k="provider-data.email" />}
                />
            </React.Fragment>
        );

        return (
            <React.Fragment>
                <div className="kip-provider-data">
                    <FormComponent onSubmit={onSubmit}>
                        <FieldSet disabled={submitting}>
                            <CardContent>{controls}</CardContent>
                            <CardFooter>
                                <SubmitField
                                    disabled={!valid || embedded & !modified}
                                    type={'success'}
                                    onClick={onSubmit}
                                    waiting={submitting}
                                    title={
                                        submitting ? (
                                            <T t={t} k="provider-data.saving" />
                                        ) : (
                                            <T
                                                t={t}
                                                k={'provider-data.submit'}
                                            />
                                        )
                                    }
                                />
                            </CardFooter>
                        </FieldSet>
                    </FormComponent>
                </div>
            </React.Fragment>
        );
    };

    return (
        <WithLoader
            resources={[keyPairs, queues, providerData]}
            renderLoaded={render}
        />
    );
};

const ContactData = withActions(
    withForm(withRouter(BaseContactData), ContactDataForm, 'form'),
    [queues, keyPairs, providerData]
);

export default ContactData;
