// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import Form from 'helpers/form';
import { keyPairs, providerData } from '../actions';
import {
    withRouter,
    withForm,
    withActions,
    Form as FormComponent,
    FieldSet,
    RetractingLabelInput,
    Switch,
    ErrorFor,
    T,
    CardFooter,
    CardContent,
    WithLoader,
    SubmitField,
    Button,
} from 'components';
import { t, Trans } from '@lingui/macro';
import './provider-data.scss';

class ProviderDataForm extends Form {
    validate() {
        const errors = {};
        if (!this.data.name || this.data.name.length < 2)
            errors.name = t({ id: 'provider-data.invalid-name', message: 'Bitte gegen Sie einen gültigen Namen an' });
        return errors;
    }
}

const BaseProviderData = ({
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

    const render = () => {
        const controls = (
            <React.Fragment>
                <ErrorFor error={error} field="name" />
                <RetractingLabelInput
                    value={data.name || ''}
                    onChange={value => setAndMarkModified('name', value)}
                    label={<Trans id="provider-data.name">Vollständiger Name</Trans>}
                />
                <ErrorFor error={error} field="street" />
                <RetractingLabelInput
                    value={data.street || ''}
                    onChange={value => setAndMarkModified('street', value)}
                    label={<Trans id="provider-data.street">Straße & Hausnummer</Trans>}
                />
                <ErrorFor error={error} field="zipCode" />
                <RetractingLabelInput
                    value={data.zipCode || ''}
                    onChange={value => setAndMarkModified('zipCode', value)}
                    label={<Trans id="provider-data.zip-code">Postleitzahl</Trans>}
                />
                <ErrorFor error={error} field="city" />
                <RetractingLabelInput
                    value={data.city || ''}
                    onChange={value => setAndMarkModified('city', value)}
                    label={<Trans id="provider-data.city">Ort</Trans>}
                />
                <ErrorFor error={error} field="website" />
                <RetractingLabelInput
                    value={data.website || ''}
                    onChange={value => setAndMarkModified('website', value)}
                    label={<Trans id="provider-data.website">Webseite</Trans>}
                />
                <ErrorFor error={error} field="description" />
                <label htmlFor="description">
                    <Trans id="provider-data.description">
                        Informationen für Impfwillige (z.B. wenn Sie spezielle Impfstoffe nur bestimmten Gruppen empfehlen)
                    </Trans>
                </label>
                <textarea
                    id="description"
                    className="bulma-textarea"
                    value={data.description || ''}
                    onChange={e =>
                        setAndMarkModified('description', e.target.value)
                    }
                />
                <h3>
                    <Trans id="provider-data.for-mediator">
                        Die folgenden Kontaktdaten dienen ausschließlich zur Kommunikation mit dem Support-Team.
                    </Trans>
                </h3>
                <ErrorFor error={error} field="phone" />
                <RetractingLabelInput
                    value={data.phone || ''}
                    onChange={value => setAndMarkModified('phone', value)}
                    label={<Trans id="provider-data.phone">Telefonnummer (nicht sichtbar für Impfinteressierte)</Trans>}
                />
                <ErrorFor error={error} field="email" />
                <RetractingLabelInput
                    value={data.email || ''}
                    onChange={value => setAndMarkModified('email', value)}
                    label={<Trans id="provider-data.email">E-Mail Adresse (nicht sichtbar für Impfinteressierte)</Trans>}
                />
                <hr />
                <ErrorFor error={error} field="code" />
                <RetractingLabelInput
                    value={data.code || ''}
                    onChange={value => setAndMarkModified('code', value)}
                    description={
                        <Trans id="provider-data.access-code.description">
                            Falls Sie einen spezifischen Zugangscode erhalten haben geben Sie diesen bitte hier ein.
                        </Trans>
                    }
                    label={<Trans id="provider-data.access-code.label">Zugangscode (falls vorhanden)</Trans>}
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
                            onChange={value =>
                                setAndMarkModified('accessible', value)
                            }
                        >
                            &nbsp;
                        </Switch>

                        <label htmlFor="accessible">
                            <Trans id="provider-data.accessible">Barrierefreier Zugang zur Praxis/zum Impfzentrum</Trans>
                        </label>
                    </li>
                </ul>
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
                                            <Trans id="provider-data.saving">Speichere...</Trans>
                                        ) : (
                                            <Trans id='provider-data.save-and-continue'>Weiter</Trans>
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
            resources={[keyPairs, providerData]}
            renderLoaded={render}
        />
    );
};

const ProviderData = withActions(
    withForm(withRouter(BaseProviderData), ProviderDataForm, 'form'),
    [keyPairs, providerData]
);

export default ProviderData;
