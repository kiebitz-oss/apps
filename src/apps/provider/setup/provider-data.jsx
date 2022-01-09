// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { useEffectOnce, useProvider, useRouter } from 'hooks';
import Form from 'helpers/form';
import {
    withForm,
    Form as FormComponent,
    FieldSet,
    RetractingLabelInput,
    Switch,
    ErrorFor,
    CardFooter,
    CardContent,
    SubmitField,
    Button,
    T,
} from 'components';
import t from './translations.yml';
import './provider-data.scss';

class ProviderDataForm extends Form {
    validate() {
        const errors = {};
        if (!this.data.name || this.data.name.length < 2)
            errors.name = this.settings.t(t, 'provider-data.invalid-name');
        return errors;
    }
}

const BaseProviderData = ({
    embedded,
    form: { set, data, error, valid, reset },
}) => {
    const [modified, setModified] = useState(false);

    const router = useRouter();
    const provider = useProvider();

    const onSubmit = () => {
        if (!valid) return;
        provider.data = data;
        // we redirect to the 'verify' step
        router.navigateToUrl(`/provider/setup/verify`);
    };

    useEffectOnce(() => {
        reset(provider.data || {});
        setModified(false);
    });

    const setAndMarkModified = (key, value) => {
        setModified(true);
        set(key, value);
    };

    const controls = (
        <React.Fragment>
            <ErrorFor error={error} field="name" />
            <RetractingLabelInput
                value={data.name || ''}
                onChange={(value) => setAndMarkModified('name', value)}
                label={<T t={t} k="provider-data.name" />}
            />
            <ErrorFor error={error} field="street" />
            <RetractingLabelInput
                value={data.street || ''}
                onChange={(value) => setAndMarkModified('street', value)}
                label={<T t={t} k="provider-data.street" />}
            />
            <ErrorFor error={error} field="zipCode" />
            <RetractingLabelInput
                value={data.zipCode || ''}
                onChange={(value) => setAndMarkModified('zipCode', value)}
                label={<T t={t} k="provider-data.zip-code" />}
            />
            <ErrorFor error={error} field="city" />
            <RetractingLabelInput
                value={data.city || ''}
                onChange={(value) => setAndMarkModified('city', value)}
                label={<T t={t} k="provider-data.city" />}
            />
            <ErrorFor error={error} field="website" />
            <RetractingLabelInput
                value={data.website || ''}
                onChange={(value) => setAndMarkModified('website', value)}
                label={<T t={t} k="provider-data.website" />}
            />
            <ErrorFor error={error} field="description" />
            <label htmlFor="description">
                <T t={t} k="provider-data.description" />
            </label>
            <textarea
                id="description"
                className="bulma-textarea"
                value={data.description || ''}
                onChange={(e) =>
                    setAndMarkModified('description', e.target.value)
                }
            />
            <h3>
                <T t={t} k="provider-data.for-mediator" />
            </h3>
            <ErrorFor error={error} field="phone" />
            <RetractingLabelInput
                value={data.phone || ''}
                onChange={(value) => setAndMarkModified('phone', value)}
                label={<T t={t} k="provider-data.phone" />}
            />
            <ErrorFor error={error} field="email" />
            <RetractingLabelInput
                value={data.email || ''}
                onChange={(value) => setAndMarkModified('email', value)}
                label={<T t={t} k="provider-data.email" />}
            />
            <hr />
            <ErrorFor error={error} field="code" />
            <RetractingLabelInput
                value={data.code || ''}
                onChange={(value) => setAndMarkModified('code', value)}
                description={
                    <T t={t} k="provider-data.access-code.description" />
                }
                label={<T t={t} k="provider-data.access-code.label" />}
            />
            <hr />
            <ul className="kip-properties">
                <li className="kip-property">
                    <Switch
                        id="accessible"
                        checked={
                            data.accessible !== undefined
                                ? data.accessible
                                : false
                        }
                        onChange={(value) =>
                            setAndMarkModified('accessible', value)
                        }
                    >
                        &nbsp;
                    </Switch>

                    <label htmlFor="accessible">
                        <T t={t} k="provider-data.accessible" />
                    </label>
                </li>
            </ul>
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <div className="kip-provider-data">
                <FormComponent onSubmit={onSubmit}>
                    <FieldSet>
                        <CardContent>{controls}</CardContent>
                        <CardFooter>
                            <SubmitField
                                disabled={!valid || embedded & !modified}
                                type={'success'}
                                onClick={onSubmit}
                                title={
                                    <T
                                        t={t}
                                        k="provider-data.save-and-continue"
                                    />
                                }
                            />
                        </CardFooter>
                    </FieldSet>
                </FormComponent>
            </div>
        </React.Fragment>
    );
};

const ProviderData = withForm(BaseProviderData, ProviderDataForm, 'form');

export default ProviderData;
