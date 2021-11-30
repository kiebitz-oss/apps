// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { FormEventHandler, useRef } from 'react';
import {
    withActions,
    CenteredCard,
    Button,
    RetractingLabelInput,
    Message,
    CardContent,
    CardFooter,
} from 'components';
import { restoreFromBackup } from 'apps/provider/actions';
import { t, Trans } from '@lingui/macro';
import './restore.scss';
import { useNavigate } from 'react-router-dom';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { formatSecret } from 'helpers/string';

interface FormData {
    file: any;
    filename: string;
    secret: string;
    localOnly: boolean;
}

const resolver: Resolver<FormData> = async values => {
    const errors: any = {};

    if (!values.file) {
        errors.file = t({
            id: 'load-backup.missing-file',
            message: 'load-backup.missing-file MISSING',
        });
    } else if (values.file.data === undefined || values.file.iv === undefined) {
        errors.file = t({
            id: 'load-backup.invalid-file',
            message: 'load-backup.invalid-file MISSING',
        });
    }

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

    return errors;
};

const RestorePage: React.FC<any> = ({
    restoreFromBackup,
    restoreFromBackupAction,
}) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { register, handleSubmit, formState, setValue } = useForm<FormData>({
        resolver,
    });

    const handleKeyDown: React.KeyboardEventHandler = event => {
        if (event.which === 13 || event.which === 23) {
            fileInput.current?.click();
        }
    };

    const readFile: FormEventHandler<HTMLInputElement> = event => {
        const file = event.currentTarget.files?.[0];
        const reader = new FileReader();

        setValue('filename', file?.name as string);

        reader.onload = e => {
            try {
                setValue('file', JSON.parse(e.target?.result as string));
            } catch (e) {
                setValue('file', undefined);
            }
        };

        if (file) {
            reader.readAsBinaryString(file);
        }
    };

    const onSubmit: SubmitHandler<FormData> = data => {
        restoreFromBackupAction(data.secret, data.file, data.localOnly).then(
            (data: any) => {
                if (data.status === 'succeeded') {
                    navigate('/provider/schedule');
                }
            }
        );
    };

    return (
        <CenteredCard className="kip-provider-restore-from-backup">
            <CardContent>
                <h1 className="bulma-subtitle">
                    <Trans id="load-backup.title">Einloggen</Trans>
                </h1>

                {restoreFromBackup !== undefined &&
                    restoreFromBackup.status === 'failed' && (
                        <Message type="danger">
                            <Trans id="load-backup.failed">
                                Das Laden Ihrer Daten ist leider fehlgeschlagen.
                                Bitte prüfen Sie Ihren Datenschlüssel sowie die
                                angegebene Datei.
                            </Trans>
                        </Message>
                    )}

                <form
                    className="kip-form"
                    name="restore"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <RetractingLabelInput
                        label={t({
                            id: 'load-backup.secret.label',
                            message: 'Datenschlüssel',
                        })}
                        description={t({
                            id: 'load-backup.secret.description',
                            message:
                                'Der Datenschlüssel, den Sie bei der Registrierung erhalten haben.',
                        })}
                        {...register('secret', {
                            onChange: event => {
                                return formatSecret(event.target.secret || '');
                            },
                        })}
                    />
                    <label
                        htmlFor="file-upload"
                        className="kip-custom-file-upload"
                    >
                        <input
                            ref={fileInput}
                            id="file-upload"
                            className="bulma-input"
                            type="file"
                            onChange={readFile}
                        />

                        {(fileInput.current?.files?.[0] !== undefined && (
                            <Trans id="load-backup.input.change">
                                {fileInput.current?.files?.[0].name}
                            </Trans>
                        )) || (
                            <Trans id="load-backup.input">
                                Sicherungsdatei wählen
                            </Trans>
                        )}
                    </label>

                    <span className="kip-retracting-label-input">
                        <p className="kip-description">
                            <Trans id="load-backup.input.description">
                                Bitte laden Sie hier Ihre Sicherungsdatei
                                (booster-impfen-backup-2021[Datum&Uhrzeit].enc)
                                hoch.
                            </Trans>
                        </p>
                    </span>
                </form>
            </CardContent>

            <CardFooter>
                <Button
                    type="success"
                    htmlType="submit"
                    disabled={!formState.isValid || formState.isSubmitting}
                >
                    <Trans id="load-backup.load">Einloggen</Trans>
                </Button>
            </CardFooter>
        </CenteredCard>
    );
};

export default withActions(RestorePage, [restoreFromBackup]);
