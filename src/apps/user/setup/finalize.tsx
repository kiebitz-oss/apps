// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, Fragment } from 'react';
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
    RetractingLabelInput as Input,
    Select,
    Switch,
    Button,
    WithLoader,
    withActions,
} from 'components';
import { Trans, t, defineMessage } from '@lingui/macro';
import type { MessageDescriptor } from '@lingui/core';
import { useNavigate } from 'react-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import props from './properties.json';
import './finalize.scss';

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
    const [noQueue, setNoQueue] = useState(false);
    const navigate = useNavigate();

    const { register, reset, handleSubmit, getValues, formState } =
        useForm<FormData>({
            mode: 'onBlur',
            reValidateMode: 'onBlur',
            defaultValues: {
                distance: 5,
                accessible: false,
                zipCode: undefined,
            },
        });

    useEffectOnce(() => {
        contactDataAction();
        userSecretAction();
        getTokenAction.reset();
        queueDataAction().then((qd: any) => {
            const initialData = {
                distance: 5,
            };

            for (const [k, v] of Object.entries(
                props['contact-data'].properties
            )) {
                for (const [kv, vv] of Object.entries(v.values)) {
                    initialData[kv] = vv._default;
                }
            }
            reset(qd.data || initialData);
        });
    });

    const onSubmit: SubmitHandler<FormData> = (data) => {
        queueDataAction(data).then(() => {
            getTokenAction(contactData.data, userSecret.data).then(
                (hd: any) => {
                    if (hd.status === 'failed') {
                        return;
                    }

                    backupDataAction(userSecret.data);
                    navigate('/user/setup/store-secrets');
                }
            );
        });
    };

    const properties = Object.entries(props['contact-data'].properties).map(
        ([k, v]) => {
            const items = Object.entries(v.values).map(([kv, vv]) => (
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
                <Fragment key={k}>
                    <h2>
                        <Trans id={contactDataPropertiesMessages[k].title.id} />
                    </h2>
                    <ul className="kip-properties">{items}</ul>
                </Fragment>
            );
        }
    );

    const render = () => {
        let noQueueMessage;
        let failedMessage;
        let failed = false;

        if (noQueue)
            noQueueMessage = (
                <Message type="danger">
                    <Trans id="wizard.no-queue.notice">
                        Im gewählten Postleitzahlgebiet ist der Dienst noch
                        nicht verfügar. Sorry!
                    </Trans>
                </Message>
            );

        if (getToken !== undefined && getToken.status === 'failed') {
            failed = true;

            if (getToken.error.error.code === 401) {
                failedMessage = (
                    <Message type="danger">
                        <Trans id="wizard.failed.invalid-code">
                            Dein Zugangscode ist ungültig oder wurde bereits
                            benutzt. Du kannst Dich nicht mehrfach registrieren.
                        </Trans>
                    </Message>
                );
            }
        }

        if (failed && !failedMessage)
            failedMessage = (
                <Message type="danger">
                    <Trans id="wizard.failed.notice">
                        Sorry, hier ist etwas schief gelaufen. Bitte versuche es
                        später erneut.
                    </Trans>
                </Message>
            );

        return (
            <form name="finalize" onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    {noQueueMessage}

                    {failedMessage}

                    <div className="kip-finalize-fields">
                        {formState.errors['zipCode'] && (
                            <p className="bulma-help bulma-is-info">
                                {formState.errors['zipCode'].message}
                                error
                            </p>
                        )}
                        <Input
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
                        type={noQueue || failed ? 'danger' : 'success'}
                        htmlType="submit"
                        disabled={formState.isSubmitting || !formState.isValid}
                    >
                        <Trans
                            id={
                                noQueue
                                    ? 'wizard.no-queue.title'
                                    : failed
                                    ? 'wizard.failed.title'
                                    : formState.isSubmitting
                                    ? 'wizard.please-wait'
                                    : 'wizard.continue'
                            }
                        >
                            {noQueue
                                ? 'Nicht verfügbar'
                                : failed
                                ? 'Fehlgeschlagen :/'
                                : formState.isSubmitting
                                ? 'Bitte warten...'
                                : 'Weiter'}
                        </Trans>
                    </Button>
                </CardFooter>
            </form>
        );
    };

    return <WithLoader resources={[]} renderLoaded={render} />;
};

export default withActions(FinalizePage, [
    getToken,
    queueData,
    contactData,
    userSecret,
    backupData,
]);
