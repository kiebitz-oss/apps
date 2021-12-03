// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    getToken,
    contactData,
    queueData,
    userSecret,
    backupData,
} from 'apps/user/actions';
import {
    CardContent,
    CardFooter,
    Message,
    RetractingLabelInput as InputField,
    Select,
    Switch,
    Button,
    withActions,
} from 'components';
import { Trans, t, defineMessage } from '@lingui/macro';
import type { MessageDescriptor } from '@lingui/core';
import { useNavigate } from 'react-router';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import props from './properties.json';
// import './finalize.scss';

const contactDataPropertiesMessages: Record<
    string,
    {
        title: MessageDescriptor;
        values: Record<string, MessageDescriptor>;
    }
> = {
    location: {
        title: defineMessage({
            id: 'contact-data.properties.location.title',
            message: 'Impfort',
        }),
        values: {
            accessible: defineMessage({
                id: 'contact-data.properties.location.values.accessible',
                message: 'Barrierefreier Impfort gewünscht',
            }),
        },
    },
};

interface FormData {
    distance: number;
    zipCode: number;
    accessible: boolean;
    [key: string]: any;
}

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const FinalizePage: React.FC<any> = ({
    queueDataAction,
    backupDataAction,
    contactData,
    contactDataAction,
    getToken,
    getTokenAction,
    userSecret,
    userSecretAction,
}) => {
    const navigate = useNavigate();

    const methods = useForm<FormData>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: {
            distance: 5,
            accessible: false,
            zipCode: undefined,
        },
    });

    const { register, reset, handleSubmit, formState } = methods;

    useEffectOnce(() => {
        contactDataAction();
        userSecretAction();
        getTokenAction.reset();
        queueDataAction().then((qd: any) => {
            const initialData: Record<string, any> = {
                distance: 5,
            };

            Object.entries(props['contact-data'].properties).forEach(
                ([_, v]: [string, any]) => {
                    Object.entries(v.values).forEach(
                        ([kv, vv]: [string, any]) => {
                            initialData[kv] = vv._default;
                        }
                    );
                }
            );
            reset(qd.data || initialData);
        });
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        await queueDataAction(data);
        console.log(contactData.data, userSecret.data);
        const hd = await getTokenAction(contactData.data, userSecret.data);

        if (hd.status === 'failed') {
            return;
        }

        backupDataAction(userSecret.data);
        navigate('/user/setup/store-secrets');
    };

    const properties = Object.entries(props['contact-data'].properties).map(
        ([k, v]) => {
            const items = Object.entries(v.values).map(([kv, _]) => (
                <li key={kv}>
                    <Switch {...register(kv)}>&nbsp;</Switch>

                    <label htmlFor={kv}>
                        <Trans
                            id={contactDataPropertiesMessages[k].values[kv].id}
                        />
                    </label>
                </li>
            ));

            return (
                <React.Fragment key={k}>
                    <h2>
                        <Trans id={contactDataPropertiesMessages[k].title.id} />
                    </h2>
                    <ul className="kip-properties">{items}</ul>
                </React.Fragment>
            );
        }
    );

    const failed = getToken?.status === 'failed';
    let failedMessage = null;

    if (failed) {
        console.log(getToken);
        if (getToken.error.error.code === 401) {
            failedMessage = (
                <Message variant="danger">
                    <Trans id="wizard.failed.invalid-code">
                        Dein Zugangscode ist ungültig oder wurde bereits
                        benutzt. Du kannst Dich nicht mehrfach registrieren.
                    </Trans>
                </Message>
            );
        } else {
            failedMessage = (
                <Message variant="danger">
                    <Trans id="wizard.failed.notice">
                        Sorry, hier ist etwas schief gelaufen. Bitte versuche es
                        später erneut.
                    </Trans>
                </Message>
            );
        }
    }

    return (
        <FormProvider {...methods}>
            <form name="finalize" onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    {failedMessage}

                    <div className="kip-finalize-fields">
                        <InputField
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

                        <label className="kip-control-label" htmlFor="distance">
                            <Trans id="contact-data.distance.label">
                                Maximale Entfernung zum Impfort in Kilometern
                                (km)
                            </Trans>

                            <span className="kip-control-notice">
                                <Trans id="contact-data.distance.notice">
                                    Achtung: Du kannst den Radius derzeit nur 1x
                                    einstellen und nicht mehr ändern!
                                </Trans>
                            </span>

                            <Select
                                options={[
                                    {
                                        value: 5,
                                        description: t({
                                            id: 'contact-data.distance.option.5',
                                            message: '5 km',
                                        }),
                                    },
                                    {
                                        value: 10,
                                        description: t({
                                            id: 'contact-data.distance.option.10',
                                            message: '10 km',
                                        }),
                                    },
                                    {
                                        value: 20,
                                        description: t({
                                            id: 'contact-data.distance.option.20',
                                            message: '20 km',
                                        }),
                                    },
                                    {
                                        value: 30,
                                        description: t({
                                            id: 'contact-data.distance.option.30',
                                            message: '30 km',
                                        }),
                                    },
                                    {
                                        value: 40,
                                        description: t({
                                            id: 'contact-data.distance.option.40',
                                            message: '40 km',
                                        }),
                                    },
                                    {
                                        value: 50,
                                        description: t({
                                            id: 'contact-data.distance.option.50',
                                            message: '50 km',
                                        }),
                                    },
                                ]}
                                {...register('distance')}
                            />
                        </label>
                        {properties}
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        waiting={formState.isSubmitting}
                        variant={failed ? 'danger' : 'success'}
                        type="submit"
                        disabled={formState.isSubmitting || !formState.isValid}
                    >
                        <Trans
                            id={
                                failed
                                    ? 'wizard.failed.title'
                                    : formState.isSubmitting
                                    ? 'wizard.please-wait'
                                    : 'wizard.continue'
                            }
                        >
                            {failed
                                ? 'Fehlgeschlagen :/'
                                : formState.isSubmitting
                                ? 'Bitte warten...'
                                : 'Weiter'}
                        </Trans>
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    );
};

export default withActions(FinalizePage, [
    getToken,
    queueData,
    contactData,
    userSecret,
    backupData,
]);
