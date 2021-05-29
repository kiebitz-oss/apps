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
        if (!this.data.name || this.data.name.length < 2)
            errors.name = this.settings.t(t, 'contact-data.invalid-name');
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
