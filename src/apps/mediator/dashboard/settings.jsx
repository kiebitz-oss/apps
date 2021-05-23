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

    const controls = (
        <React.Fragment>
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
            <h2>
                <T t={t} k="provider-data.optional.title" />
            </h2>
            <p>
                <T t={t} k="provider-data.optional.text" />
            </p>
            <ErrorFor error={error} field="email" />
            <RetractingLabelInput
                value={data.email || ''}
                onChange={value => setAndMarkModified('email', value)}
                label={<T t={t} k="provider-data.email" />}
            />
            <ErrorFor error={error} field="street" />
            <RetractingLabelInput
                value={data.street || ''}
                onChange={value => setAndMarkModified('street', value)}
                label={<T t={t} k="provider-data.street" />}
            />
            <ErrorFor error={error} field="zip-code" />
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
        </React.Fragment>
    );

    const redirecting = false;

    return (
        <React.Fragment>
            <div className="kip-cm-provider-data">
                <FormComponent onSubmit={onSubmit}>
                    <FieldSet disabled={submitting}>
                        {
                            <React.Fragment>
                                <h2>
                                    <T t={t} k="saveAndRestore" />
                                </h2>
                                <h2>
                                    <T t={t} k="providerData" />
                                </h2>
                                {controls}
                                <SubmitField
                                    disabled={!valid}
                                    type={'success'}
                                    onClick={onSubmit}
                                    waiting={submitting || redirecting}
                                    title={
                                        redirecting ? (
                                            <T
                                                t={t}
                                                k="provider-data.success"
                                            />
                                        ) : submitting ? (
                                            <T t={t} k="provider-data.saving" />
                                        ) : (
                                            <T
                                                t={t}
                                                k={
                                                    'provider-data.save-and-continue'
                                                }
                                            />
                                        )
                                    }
                                />
                            </React.Fragment>
                        }
                    </FieldSet>
                </FormComponent>
            </div>
        </React.Fragment>
    );
};

const Settings = withActions(
    withForm(withRouter(withSettings(BaseSettings)), SettingsForm, 'form'),
    []
);

export default Settings;
