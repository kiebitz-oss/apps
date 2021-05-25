// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import Form from 'helpers/form';
import {
    withRouter,
    withSettings,
    withForm,
    withActions,
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
import './settings.scss';

class SettingsForm extends Form {
    validate() {
        const errors = {};
        if (!this.data.name || this.data.name.length < 2)
            errors.name = this.settings.t(t, 'provider-data.invalid-name');
        return errors;
    }
}

const BaseSettings = ({
    type,
    settings,
    form: { set, data, error, valid },
    router,
}) => {
    const [modified, setModified] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const onSubmit = () => {
        if (!valid) return;
        // we store the contact data so it can be used in the next step
        SettingsAction(data);
        // we redirect to the 'store-secrets' step
        router.navigateToUrl(`/setup/${type}/verify`);
    };

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        setModified(false);
    });

    const submitting = false;

    const setAndMarkModified = (key, value) => {
        setModified(true);
        set(key, value);
    };

    const redirecting = false;

    return (
        <React.Fragment>
            <div className="kip-cm-provider-data"></div>
        </React.Fragment>
    );
};

const Settings = withActions(
    withForm(withRouter(withSettings(BaseSettings)), SettingsForm, 'form'),
    []
);

export default Settings;
