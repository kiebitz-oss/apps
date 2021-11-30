// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    withActions,
    CenteredCard,
    Button,
    RetractingLabelInput,
    Message,
    CardContent,
    CardHeader,
    CardFooter,
} from 'components';
import { restoreFromBackup } from 'apps/user/actions';
import { t, Trans } from '@lingui/macro';
import { SubmitHandler, useForm } from 'react-hook-form';
import './restore.scss';
import { useNavigate } from 'react-router-dom';

function formatSecret(secret: string) {
    const parts = secret.match(/.{1,4}/g);
    if (parts === null) return secret;
    return parts.join('  ');
}

interface FormData {
    secret: string;
}

const RestorePage: React.FC<any> = ({
    restoreFromBackup,
    restoreFromBackupAction,
}) => {
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<FormData> = (data: any) => {
        restoreFromBackupAction(data.secret).then((data: any) => {
            if (data.status === 'succeeded') {
                navigate('/user/appointments');
            }
        });
    };

    const { register, handleSubmit, formState } = useForm<FormData>({
        resolver: async values => {
            const errors: Partial<FormData> = {};

            if (values.secret !== undefined) {
                values.secret = values.secret
                    .toLowerCase()
                    .replace(/[^abcdefghijkmnpqrstuvwxyz23456789]/g, '');
            }

            if (
                !/[abcdefghijkmnpqrstuvwxyz23456789]{16,20}/i.exec(
                    values.secret
                )
            ) {
                errors.secret = t({ id: 'load-backup.invalid-secret' });
            }

            return {
                values,
                errors,
            };
        },
    });

    return (
        <CenteredCard className="kip-user-restore-from-backup">
            <CardHeader>
                <h1 className="bulma-subtitle">
                    <Trans id="load-backup.title">Anmelden</Trans>
                </h1>
            </CardHeader>
            <CardContent>
                {restoreFromBackup?.status === 'failed' && (
                    <Message type="danger">
                        <Trans id="load-backup.failed">
                            Das Laden Deiner Daten ist leider fehlgeschlagen.
                            Bitte prüfe Deinen Sicherheitscode.
                        </Trans>
                    </Message>
                )}

                <form
                    className="kip-form"
                    name="restore"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <RetractingLabelInput
                        label={
                            <Trans id="load-backup.secret.label">
                                Sicherheitscode
                            </Trans>
                        }
                        description={
                            <Trans id="load-backup.secret.description">
                                Der Sicherheitscode, den Du bei der
                                Registrierung erhalten hast.
                            </Trans>
                        }
                        {...register('secret', {
                            onChange: event =>
                                formatSecret(event.target.value || ''),
                        })}
                    />
                </form>
            </CardContent>
            <CardFooter>
                <Button
                    type="success"
                    disabled={!formState.isValid || formState.isSubmitting}
                >
                    <Trans id="load-backup.load">Anmelden</Trans>
                </Button>
            </CardFooter>
        </CenteredCard>
    );
};

export default withActions(RestorePage, [restoreFromBackup]);
