// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { keyPairs, providerData } from '../actions';
import {
    RetractingLabelInput,
    Switch,
    CardFooter,
    CardContent,
    WithLoader,
    SubmitField,
    withActions,
} from 'components';
import { t, Trans } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import './provider-data.scss';

interface FormData {
    name: string;
    street: string;
    zipCode: string;
    city: string;
    website: string;
    description: string;
    phone: string;
    email: string;
    accessible: boolean;
    accessCode: string;
}

const resolver: Resolver<FormData> = async values => {
    const errors: any = {};

    if (!values.name || values.name.length < 2) {
        errors.name = t({
            id: 'provider-data.invalid-name',
            message: 'Bitte gegen Sie einen gültigen Namen an',
        });
    }

    return {
        errors,
        values,
    };
};

const BaseProviderData: React.FC<any> = ({
    keyPairs,
    keyPairsAction,
    providerData,
    providerDataAction,
    embedded,
}) => {
    const navigate = useNavigate();

    const { register, reset, handleSubmit, formState } = useForm<FormData>({
        resolver,
        defaultValues: {},
    });

    const onSubmit: SubmitHandler<FormData> = data => {
        providerDataAction(data);

        // we redirect to the 'verify' step
        navigate(`/provider/setup/verify`);
    };

    useEffectOnce(() => {
        keyPairsAction();
        providerDataAction().then((pd: any) => {
            reset(pd.data.data);
        });
    });

    const render = () => {
        return (
            <div className="kip-provider-data">
                <form
                    className="kip-form"
                    name="provider-data"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <CardContent>
                        <RetractingLabelInput
                            label={
                                <Trans id="provider-data.name">
                                    Vollständiger Name
                                </Trans>
                            }
                            {...register('name')}
                        />

                        <RetractingLabelInput
                            label={
                                <Trans id="provider-data.street">
                                    Straße & Hausnummer
                                </Trans>
                            }
                            {...register('street')}
                        />

                        <RetractingLabelInput
                            label={
                                <Trans id="provider-data.zip-code">
                                    Postleitzahl
                                </Trans>
                            }
                            {...register('zipCode')}
                        />

                        <RetractingLabelInput
                            label={<Trans id="provider-data.city">Ort</Trans>}
                            {...register('city')}
                        />

                        <RetractingLabelInput
                            label={
                                <Trans id="provider-data.website">
                                    Webseite
                                </Trans>
                            }
                            {...register('website')}
                        />

                        <label htmlFor="description">
                            <Trans id="provider-data.description">
                                Informationen für Impfwillige (z.B. wenn Sie
                                spezielle Impfstoffe nur bestimmten Gruppen
                                empfehlen)
                            </Trans>
                        </label>

                        <textarea
                            className="bulma-textarea"
                            {...register('description')}
                        />

                        <h3>
                            <Trans id="provider-data.for-mediator">
                                Die folgenden Kontaktdaten dienen ausschließlich
                                zur Kommunikation mit dem Support-Team.
                            </Trans>
                        </h3>

                        <RetractingLabelInput
                            label={
                                <Trans id="provider-data.phone">
                                    Telefonnummer (nicht sichtbar für
                                    Impfinteressierte)
                                </Trans>
                            }
                            {...register('phone')}
                        />

                        <RetractingLabelInput
                            label={
                                <Trans id="provider-data.email">
                                    E-Mail Adresse (nicht sichtbar für
                                    Impfinteressierte)
                                </Trans>
                            }
                            type="email"
                            {...register('email')}
                        />

                        <hr />

                        <RetractingLabelInput
                            description={
                                <Trans id="provider-data.access-code.description">
                                    Falls Sie einen spezifischen Zugangscode
                                    erhalten haben geben Sie diesen bitte hier
                                    ein.
                                </Trans>
                            }
                            label={
                                <Trans id="provider-data.access-code.label">
                                    Zugangscode (falls vorhanden)
                                </Trans>
                            }
                            {...register('accessCode')}
                        />

                        <hr />

                        <Switch id="accessible" {...register('accessible')} />

                        <label htmlFor="accessible">
                            <Trans id="provider-data.accessible">
                                Barrierefreier Zugang zur Praxis/zum Impfzentrum
                            </Trans>
                        </label>
                    </CardContent>

                    <CardFooter>
                        <SubmitField
                            disabled={
                                !formState.isValid ||
                                (embedded && formState.isDirty)
                            }
                            type="success"
                            htmlType="submit"
                            waiting={formState.isSubmitting}
                            title={
                                formState.isSubmitting ? (
                                    <Trans id="provider-data.saving">
                                        Speichere...
                                    </Trans>
                                ) : (
                                    <Trans id="provider-data.save-and-continue">
                                        Weiter
                                    </Trans>
                                )
                            }
                        />
                    </CardFooter>
                </form>
            </div>
        );
    };

    return (
        <WithLoader
            resources={[keyPairs, providerData]}
            renderLoaded={render}
        />
    );
};

const ProviderData = withActions(BaseProviderData, [keyPairs, providerData]);

export default ProviderData;
