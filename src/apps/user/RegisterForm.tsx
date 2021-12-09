// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Trans, t } from '@lingui/macro';
import { useNavigate } from 'react-router';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import {
    BoxContent,
    BoxFooter,
    Form,
    SelectField,
    SwitchField,
    Box,
    InputField,
    Message,
} from 'ui';
import {
    contactData,
    getToken,
    queueData,
    userSecret,
    backupData,
} from './actions';
import { withActions } from 'components';
import { useEffectOnce } from 'react-use';
import { FormSubmitButton } from 'ui/FormSubmitButton';

interface FormData {
    zipCode: number;
    distance: number;
    accessible: boolean;
    [key: string]: any;
}

const defaultValues: Partial<FormData> = {
    distance: 5,
    accessible: false,
};

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const RegisterFormBase: React.FC<any> = ({
    queueDataAction,
    backupDataAction,
    contactData,
    contactDataAction,
    getToken,
    getTokenAction,
    userSecret,
    userSecretAction,
    className,
}) => {
    const navigate = useNavigate();

    const methods = useForm<FormData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues,
    });

    const { register, reset, handleSubmit, formState } = methods;

    useEffectOnce(() => {
        contactDataAction();
        userSecretAction();
        getTokenAction.reset();
        queueDataAction().then(({ data: queueData }: any) => {
            reset(queueData || defaultValues);
        });
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        await queueDataAction(data);

        const hd = await getTokenAction(contactData.data, userSecret.data);

        if (hd.status === 'failed') {
            // @TODO this should throw an exception/error
            return;
        }

        backupDataAction(userSecret.data);
        navigate('/user/setup/store-secrets');
    };

    const failed = getToken?.status === 'failed';

    return (
        <FormProvider {...methods}>
            <Form
                name="finalize"
                onSubmit={handleSubmit(onSubmit)}
                className={className}
            >
                <Box as="div">
                    <BoxContent>
                        {failed && getToken?.error?.error?.code === 401 && (
                            <Message variant="danger">
                                <Trans id="wizard.failed.invalid-code">
                                    Dein Zugangscode ist ungültig oder wurde
                                    bereits benutzt. Du kannst Dich nicht
                                    mehrfach registrieren.
                                </Trans>
                            </Message>
                        )}

                        {failed && getToken?.error?.error?.code !== 401 && (
                            <Message variant="danger">
                                <Trans id="wizard.failed.notice">
                                    Sorry, hier ist etwas schief gelaufen. Bitte
                                    versuche es später erneut.
                                </Trans>
                            </Message>
                        )}

                        <div className="grid grid-cols-6 gap-6 w-full">
                            <InputField
                                className="col-span-6 sm:col-span-6"
                                label={t({
                                    id: 'contact-data.zip-code',
                                    message: 'Postleitzahl Deines Wohnorts',
                                })}
                                minLength={5}
                                required
                                {...register('zipCode', {
                                    required: {
                                        value: true,
                                        message: t({
                                            id: 'contact-data.invalid-zip-code',
                                            message:
                                                'Bitte trage eine gültige Postleitzahl ein.',
                                        }),
                                    },
                                    minLength: {
                                        value: 5,
                                        message: t({
                                            id: 'contact-data.invalid-zip-code',
                                            message:
                                                'Bitte trage eine gültige Postleitzahl ein.',
                                        }),
                                    },
                                    maxLength: {
                                        value: 5,
                                        message: t({
                                            id: 'contact-data.invalid-zip-code',
                                            message:
                                                'Bitte trage eine gültige Postleitzahl ein.',
                                        }),
                                    },
                                })}
                            />

                            <SelectField
                                className="col-span-6 sm:col-span-6"
                                label={t({
                                    id: 'contact-data.distance.label',
                                    message:
                                        'Maximale Entfernung zum Impfort in Kilometern (km)',
                                })}
                                options={[
                                    {
                                        value: 5,
                                        label: t({
                                            id: 'contact-data.distance.option.5',
                                            message: '5 km',
                                        }),
                                    },
                                    {
                                        value: 10,
                                        label: t({
                                            id: 'contact-data.distance.option.10',
                                            message: '10 km',
                                        }),
                                    },
                                    {
                                        value: 20,
                                        label: t({
                                            id: 'contact-data.distance.option.20',
                                            message: '20 km',
                                        }),
                                    },
                                    {
                                        value: 30,
                                        label: t({
                                            id: 'contact-data.distance.option.30',
                                            message: '30 km',
                                        }),
                                    },
                                    {
                                        value: 40,
                                        label: t({
                                            id: 'contact-data.distance.option.40',
                                            message: '40 km',
                                        }),
                                    },
                                    {
                                        value: 50,
                                        label: t({
                                            id: 'contact-data.distance.option.50',
                                            message: '50 km',
                                        }),
                                    },
                                ]}
                                description={t({
                                    id: 'contact-data.distance.notice',
                                    message:
                                        'Achtung: Du kannst den Radius derzeit nur 1x einstellen und nicht mehr ändern!',
                                })}
                            />

                            <SwitchField
                                className="col-span-6 "
                                label={t({
                                    id: 'contact-data.accessible.label',
                                    message: 'Barrierefreier Impfort gewünscht',
                                })}
                                {...register('accessible')}
                            />
                        </div>
                    </BoxContent>

                    <BoxFooter>
                        <FormSubmitButton formState={formState}>
                            <Trans id="wizard.continue">Weiter</Trans>
                        </FormSubmitButton>
                    </BoxFooter>
                </Box>
            </Form>
        </FormProvider>
    );
};

export const RegisterForm = withActions(RegisterFormBase, [
    getToken,
    queueData,
    contactData,
    userSecret,
    backupData,
]);
