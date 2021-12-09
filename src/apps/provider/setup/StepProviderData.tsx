// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { t, Trans } from '@lingui/macro';
import { keyPairs, providerData } from 'apps/provider/actions';
import {
    InputField,
    BoxFooter,
    BoxContent,
    Form,
    TextareaField,
    Title,
    SwitchField,
    Box,
    BoxHeader,
} from 'ui';
import { WithLoader, withActions } from 'components';
import { FormSubmitButton } from 'ui/FormSubmitButton';

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

const StepProviderDataBase: React.FC<any> = ({
    keyPairs,
    keyPairsAction,
    providerData,
    providerDataAction,
}) => {
    const navigate = useNavigate();

    useEffectOnce(() => {
        keyPairsAction();
        providerDataAction().then((pd: any) => {
            reset(pd.data.data);
        });
    });

    const methods = useForm<FormData>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: {},
    });

    const { register, reset, handleSubmit, formState } = methods;

    const onSubmit: SubmitHandler<FormData> = (data) => {
        providerDataAction(data);

        // we redirect to the 'verify' step
        navigate(`/provider/setup/verify`);
    };

    const render = () => {
        return (
            <FormProvider {...methods}>
                <Form name="provider-data" onSubmit={handleSubmit(onSubmit)}>
                    <BoxContent className="flex flex-col gap-12">
                        <fieldset className="flex flex-col gap-6">
                            <legend>
                                <Title level={2}>Allgemeine Daten</Title>
                            </legend>

                            <InputField
                                label={t({
                                    id: 'provider-data.name',
                                    message: 'Vollständiger Name',
                                })}
                                required
                                {...register('name', {
                                    required: t({
                                        id: 'provider-data.invalid-name',
                                        message:
                                            'Bitte gegen Sie einen gültigen Namen an',
                                    }),
                                    minLength: {
                                        value: 5,
                                        message: t({
                                            id: 'provider-data.invalid-name',
                                            message:
                                                'Bitte gegen Sie einen gültigen Namen an',
                                        }),
                                    },
                                })}
                            />

                            <InputField
                                label={t({
                                    id: 'provider-data.street',
                                    message: 'Straße & Hausnummer',
                                })}
                                required
                                {...register('street', {
                                    required: t({
                                        id: 'provider-data.invalid-street',
                                        message:
                                            'Bitte gegen Sie eine gültige Straße an',
                                    }),
                                })}
                            />
                            <div className="grid grid-cols-6 gap-4">
                                <InputField
                                    className="col-span-6 md:col-span-2"
                                    label={t({
                                        id: 'provider-data.zip-code',
                                        message: 'Postleitzahl',
                                    })}
                                    required
                                    {...register('zipCode', {
                                        required: t({
                                            id: 'provider-data.invalid-zip-code',
                                            message:
                                                'Bitte gegen Sie eine gültige Postleitzahl an',
                                        }),
                                    })}
                                />

                                <InputField
                                    className="col-span-6 md:col-span-4"
                                    label={t({
                                        id: 'provider-data.city',
                                        message: 'Ort',
                                    })}
                                    required
                                    {...register('city', {
                                        required: t({
                                            id: 'provider-data.invalid-city',
                                            message:
                                                'Bitte gegen Sie einen gültigen Ort an',
                                        }),
                                    })}
                                />
                            </div>

                            <InputField
                                label={t({
                                    id: 'provider-data.website',
                                    message: 'Webseite',
                                })}
                                {...register('website')}
                            />

                            <TextareaField
                                label={t({
                                    id: 'provider-data.description.title',
                                    message: 'Beschreibung',
                                })}
                                description={t({
                                    id: 'provider-data.description.description',
                                    message:
                                        'Informationen für Impfwillige (z.B. wenn Sie spezielle Impfstoffe nur bestimmten Gruppen empfehlen)',
                                })}
                                {...register('description')}
                            />
                        </fieldset>

                        <fieldset className="flex flex-col gap-6">
                            <legend>
                                <Title level={2}>
                                    <Trans id="provider-data.for-mediator-title">
                                        Kontaktdaten
                                    </Trans>
                                </Title>

                                <p className="pb-8">
                                    <Trans id="provider-data.for-mediator">
                                        Die folgenden Kontaktdaten dienen
                                        ausschließlich zur Kommunikation mit dem
                                        Support-Team.
                                    </Trans>
                                </p>
                            </legend>

                            <InputField
                                label={t({
                                    id: 'provider-data.phone',
                                    message:
                                        'Telefonnummer (nicht sichtbar für Impfinteressierte)',
                                })}
                                {...register('phone')}
                            />

                            <InputField
                                label={t({
                                    id: 'provider-data.email',
                                    message:
                                        'E-Mail Adresse (nicht sichtbar für Impfinteressierte)',
                                })}
                                type="email"
                                {...register('email')}
                            />

                            <InputField
                                description={t({
                                    id: 'provider-data.access-code.description',
                                    message:
                                        'Falls Sie einen spezifischen Zugangscode erhalten haben geben Sie diesen bitte hier ein.',
                                })}
                                label={t({
                                    id: 'provider-data.access-code.label',
                                    message: 'Zugangscode (falls vorhanden)',
                                })}
                                {...register('accessCode')}
                            />
                        </fieldset>

                        <fieldset className="flex flex-col gap-6">
                            <legend>
                                <Title level={2}>Einstellungen</Title>
                            </legend>

                            <SwitchField
                                label={t({
                                    id: 'provider-data.accessible',
                                    message:
                                        'Barrierefreier Zugang zur Praxis/zum Impfzentrum',
                                })}
                                {...register('accessible')}
                            />
                        </fieldset>
                    </BoxContent>

                    <BoxFooter>
                        <FormSubmitButton formState={formState}>
                            <Trans id="provider-data.save-and-continue">
                                Weiter
                            </Trans>
                        </FormSubmitButton>
                    </BoxFooter>
                </Form>
            </FormProvider>
        );
    };

    return (
        <Box>
            <BoxHeader>
                <Title>Daten der Impfstelle erfassen</Title>
            </BoxHeader>

            <WithLoader
                resources={[keyPairs, providerData]}
                renderLoaded={render}
            />
        </Box>
    );
};

export const StepProviderData = Object.assign(
    withActions(StepProviderDataBase, [keyPairs, providerData]),
    { step: 'enter-provider-data' }
);
