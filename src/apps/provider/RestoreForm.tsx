// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { withActions } from 'components';
import { Box, InputField, Message, BoxContent, BoxFooter, Form } from 'ui';
import { restoreFromBackup } from 'apps/provider/actions';
import { t, Trans } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import {
    FormProvider,
    Resolver,
    SubmitHandler,
    useForm,
} from 'react-hook-form';
import { FormSubmitButton } from 'ui/FormSubmitButton';

interface FormData {
    file: string;
    secret: string;
    localOnly: boolean;
}

const resolver: Resolver<FormData> = async (values) => {
    const errors: any = {};

    if (!values.file) {
        errors.file = t({
            id: 'load-backup.missing-file',
            message: 'load-backup.missing-file MISSING',
        });
    }

    /* else if (values.file.data === undefined || values.file.iv === undefined) {
        errors.file = t({
            id: 'load-backup.invalid-file',
            message: 'load-backup.invalid-file MISSING',
        });
    } */

    if (values.secret !== undefined) {
        values.secret = values.secret
            .toLowerCase()
            .replace(/[^abcdefghijkmnpqrstuvwxyz23456789]/g, '');
    }

    if (!/[abcdefghijkmnpqrstuvwxyz23456789]{16,20}/i.exec(values.secret)) {
        errors.secret = t({
            id: 'load-backup.invalid-secret',
            message: 'load-backup.invalid-secret MISSING',
        });
    }

    return { values, errors };
};

const RestoreFormBase: React.FC<any> = ({
    restoreFromBackup,
    restoreFromBackupAction,
    className,
}) => {
    const [file, setFile] = useState<string>();
    const fileInput = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const methods = useForm<FormData>({
        reValidateMode: 'onChange',
        mode: 'onChange',
        resolver,
    });

    const { register, handleSubmit, formState, setError, setValue } = methods;

    useEffect(() => {
        if (file !== undefined) {
            setValue('file', file, {
                shouldDirty: true,
            });
        }
    }, [file, setValue]);

    const onFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const file = event.currentTarget.files?.[0];
        const reader = new FileReader();

        reader.addEventListener(
            'load',
            (event) => {
                try {
                    setFile(event.target?.result?.toString());
                } catch (error) {
                    setError(
                        'file',
                        new Error(
                            t({
                                id: 'load-backup.invalid-file',
                                message: 'load-backup.invalid-file MISSING',
                            })
                        )
                    );
                }
            },
            false
        );

        if (file) {
            reader.readAsBinaryString(file);
        }
    };

    const onSubmit: SubmitHandler<FormData> = (data) => {
        restoreFromBackupAction(
            data.secret,
            JSON.parse(data.file),
            data.localOnly
        ).then((data: any) => {
            if (data.status === 'succeeded') {
                navigate('/provider/schedule');
            }
        });
    };

    return (
        <FormProvider {...methods}>
            <Form
                name="restore"
                onSubmit={handleSubmit(onSubmit)}
                className={className}
            >
                <Box as="div">
                    <BoxContent className="flex flex-col gap-8">
                        {restoreFromBackup?.status === 'failed' && (
                            <Message variant="danger">
                                <Trans id="load-backup.failed">
                                    Das Laden Ihrer Daten ist leider
                                    fehlgeschlagen. Bitte prüfen Sie Ihren
                                    Datenschlüssel sowie die angegebene Datei.
                                </Trans>
                            </Message>
                        )}

                        <InputField
                            label={t({
                                id: 'load-backup.secret.label',
                                message: 'Datenschlüssel',
                            })}
                            description={t({
                                id: 'load-backup.secret.description',
                                message:
                                    'Der Datenschlüssel, den Sie bei der Registrierung erhalten haben.',
                            })}
                            required
                            {...register(
                                'secret' /* {
                                onChange: (event) => {
                                    return formatSecret(
                                        event.target.secret || ''
                                    );
                                },
                            } */
                            )}
                        />

                        <div className="field">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer button primary md"
                            >
                                <input
                                    ref={fileInput}
                                    onChange={onFileChange}
                                    id="file-upload"
                                    className="absolute inset-0 w-auto opacity-0 -z-10"
                                    type="file"
                                    accept=".enc"
                                />

                                <input type="hidden" {...register('file')} />

                                {(fileInput.current?.files?.[0] !==
                                    undefined && (
                                    <Trans id="load-backup.input.change">
                                        {fileInput.current?.files?.[0].name}
                                    </Trans>
                                )) || (
                                    <Trans id="load-backup.input">
                                        Sicherungsdatei wählen
                                    </Trans>
                                )}
                            </label>

                            <p className="hint">
                                <Trans id="load-backup.input.description">
                                    Bitte laden Sie hier Ihre Sicherungsdatei
                                    (booster-impfen-backup-2021[Datum&Uhrzeit].enc)
                                    hoch.
                                </Trans>
                            </p>
                        </div>
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

export const RestoreForm = withActions(RestoreFormBase, [restoreFromBackup]);
