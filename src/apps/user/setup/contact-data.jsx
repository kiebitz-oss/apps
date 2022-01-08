// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import Form from 'helpers/form';
import { useUser } from 'hooks';
import { contactData } from 'apps/user/actions';
import {
    withRouter,
    withForm,
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
    form: { set, data, error, valid, reset },
    router,
}) => {
    const [modified, setModified] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const user = useUser();

    const onSubmit = () => {
        if (!valid) return;
        user.contactData = data;
        // we redirect to the 'verify' step
        router.navigateToUrl(`/user/setup/finalize`);
    };

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        setModified(false);
        reset(user.contactData || {});
    });

    const submitting = false;

    const setAndMarkModified = (key, value) => {
        setModified(true);
        set(key, value);
    };

    const controls = (
        <React.Fragment>
            <ErrorFor error={error} field="code" />
            <RetractingLabelInput
                value={data.code || ''}
                onChange={(value) => setAndMarkModified('code', value)}
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

const ContactData = withForm(
    withRouter(BaseContactData),
    ContactDataForm,
    'form'
);

export default ContactData;
