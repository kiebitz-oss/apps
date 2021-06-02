// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import Form from 'helpers/form';
import { contactData } from 'apps/user/actions';
import {
    withRouter,
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
import t from './translations.yml';
import './contact-data.scss';

class ContactDataForm extends Form {
    validate() {
        const errors = {};
        return errors;
    }
}

const BaseContactData = ({
    contactData,
    contactDataAction,
    form: { set, data, error, valid, reset },
    router,
}) => {
    const [modified, setModified] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const onSubmit = () => {
        if (!valid) return;
        contactDataAction(data);
        // we redirect to the 'verify' step
        router.navigateToUrl(`/user/setup/verify`);
    };

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        setModified(false);
        contactDataAction().then(ct => reset(ct.data));
    });

    const submitting = false;

    const setAndMarkModified = (key, value) => {
        setModified(true);
        set(key, value);
    };

    const controls = (
        <React.Fragment>
            <ErrorFor error={error} field="email" />
            <RetractingLabelInput
                description={<T t={t} k="contact-data.email.description" />}
                value={data.email || ''}
                onChange={value => setAndMarkModified('email', value)}
                label={<T t={t} k="contact-data.email.label" />}
            />
            <ErrorFor error={error} field="code" />
            <RetractingLabelInput
                value={data.code || ''}
                onChange={value => setAndMarkModified('code', value)}
                description={
                    <T t={t} k="contact-data.access-code.description" />
                }
                label={<T t={t} k="contact-data.access-code.label" />}
            />
        </React.Fragment>
    );

    const redirecting = false;

    return (
        <React.Fragment>
            <div className="kip-cm-contact-data">
                <FormComponent onSubmit={onSubmit}>
                    <FieldSet disabled={submitting}>
                        {
                            <React.Fragment>
                                <CardContent>{controls}</CardContent>
                                <CardFooter>
                                    <SubmitField
                                        disabled={!valid}
                                        type={'success'}
                                        onClick={onSubmit}
                                        waiting={submitting || redirecting}
                                        title={
                                            redirecting ? (
                                                <T
                                                    t={t}
                                                    k="contact-data.success"
                                                />
                                            ) : submitting ? (
                                                <T
                                                    t={t}
                                                    k="contact-data.saving"
                                                />
                                            ) : (
                                                <T
                                                    t={t}
                                                    k={
                                                        'contact-data.save-and-continue'
                                                    }
                                                />
                                            )
                                        }
                                    />
                                </CardFooter>
                            </React.Fragment>
                        }
                    </FieldSet>
                </FormComponent>
            </div>
        </React.Fragment>
    );
};

const ContactData = withActions(
    withForm(withRouter(BaseContactData), ContactDataForm, 'form'),
    [contactData]
);

export default ContactData;

/*
            <h2>
                <T t={t} k="contact-data.optional.title" />
            </h2>
            <ErrorFor error={error} field="name" />
            <RetractingLabelInput
                value={data.name || ''}
                onChange={value => setAndMarkModified('name', value)}
                label={<T t={t} k="contact-data.name" />}
            />

*/
