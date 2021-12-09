// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    Box,
    Button,
    InputField,
    Message,
    BoxContent,
    BoxFooter,
    Form,
} from 'ui';
import { withActions } from 'components';
import { restoreFromBackup } from 'apps/user/actions';
import { t, Trans } from '@lingui/macro';
import {
    FormProvider,
    Resolver,
    SubmitHandler,
    useForm,
} from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatSecret } from 'helpers/string';
import type { ActionStatus } from 'types';
import { FormSubmitButton } from 'ui/FormSubmitButton';

interface FormData {
    secret: string;
}

const resolver: Resolver<FormData> = async (values) => {
    const errors: Partial<FormData> = {};

    if (values.secret !== undefined) {
        values.secret = values.secret
            .toLowerCase()
            .replace(/[^abcdefghijkmnpqrstuvwxyz23456789]/g, '');
    }

    if (!/[abcdefghijkmnpqrstuvwxyz23456789]{16,20}/i.exec(values.secret)) {
        errors.secret = t({ id: 'load-backup.invalid-secret' });
    }

    return {
        values,
        errors,
    };
};

const RestoreBaseForm: React.FC<any> = ({
    restoreFromBackup,
    restoreFromBackupAction,
    className,
}) => {
    const navigate = useNavigate();
    const { hash } = useLocation();

    const onSubmit: SubmitHandler<FormData> = ({ secret }) => {
        restoreFromBackupAction(secret).then(
            ({ status }: { status: ActionStatus }) => {
                if (status === 'succeeded') {
                    navigate('/user/appointments');
                }
            }
        );
    };

    const methods = useForm<FormData>({
        resolver,
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            secret: hash.match(/#(\S*),v0\.1/i)?.[1],
        },
    });

    const { register, handleSubmit, formState } = methods;

    return (
        <FormProvider {...methods}>
            <Form
                name="restore"
                onSubmit={handleSubmit(onSubmit)}
                className={className}
            >
                <Box as="div">
                    <BoxContent>
                        <InputField
                            label={t({
                                id: 'load-backup.secret.label',
                                message: 'Sicherheitscode',
                            })}
                            description={t({
                                id: 'load-backup.secret.description',
                                message:
                                    'Der Sicherheitscode, den Du bei der Registrierung erhalten hast.',
                            })}
                            {...register('secret', {
                                required: true,
                                setValueAs: (value) =>
                                    formatSecret(value || ''),
                            })}
                        />

                        {restoreFromBackup?.status === 'failed' && (
                            <Message variant="danger">
                                <Trans id="load-backup.failed">
                                    Das Laden Deiner Daten ist leider
                                    fehlgeschlagen. Bitte prüfe Deinen
                                    Sicherheitscode.
                                </Trans>
                            </Message>
                        )}
                    </BoxContent>

                    <BoxFooter>
                        <FormSubmitButton formState={formState}>
                            <Trans id="load-backup.load">Einloggen</Trans>
                        </FormSubmitButton>
                    </BoxFooter>
                </Box>
            </Form>
        </FormProvider>
    );
};

export const RestoreForm = withActions(RestoreBaseForm, [restoreFromBackup]);
