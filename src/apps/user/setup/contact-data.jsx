// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import Form from 'helpers/form';
import { contactData } from 'apps/user/actions';
import {
    withForm,
    withActions,
    Form as FormComponent,
    FieldSet,
    RetractingLabelInput,
    ErrorFor,
    CardFooter,
    CardContent,
    SubmitField,
} from 'components';
import { Trans } from '@lingui/macro';
import './contact-data.scss';
import { useNavigate } from 'react-router-dom';

class ContactDataForm extends Form {
    validate() {
        const errors = {};
        return errors;
    }
}

const BaseContactData = ({
    contactDataAction,
    form: { set, data, error, valid, reset },
}) => {
    const [modified, setModified] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();

    const onSubmit = () => {
        if (!valid) return;
        contactDataAction(data);
        // we redirect to the 'verify' step
        navigate(`/user/setup/finalize`);
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
            <ErrorFor error={error} field="code" />
            <RetractingLabelInput
                value={data.code || ''}
                onChange={value => setAndMarkModified('code', value)}
                description={
                    <Trans id="contact-data.access-code.description">
                        Zugangscodes sind nur für bestimmte Impfstellen notwendig. Wenn kein Zugangscode vorliegt, leer lassen.
                    </Trans>
                }
                label={<Trans id="contact-data.access-code.label">Zugangscode</Trans>}
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
                                                <Trans id="contact-data.success">contact-data.success MISSING</Trans>
                                            ) : submitting ? (
                                                <Trans id="contact-data.saving">contact-data.saving MISSING</Trans>
                                            ) : (
                                                <Trans id='contact-data.save-and-continue'>Weiter</Trans>
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
    withForm(BaseContactData, ContactDataForm, 'form'),
    [contactData]
);

export default ContactData;
