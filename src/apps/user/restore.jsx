// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import {
    withActions,
    withSettings,
    withForm,
    CenteredCard,
    Button,
    RetractingLabelInput,
    Message,
    CardContent,
    CardHeader,
    CardFooter,
    Form as FormComponent,
    FieldSet,
} from 'components';
import { restoreFromBackup } from 'apps/user/actions';
import { Trans } from '@lingui/macro';
import Form from 'helpers/form';
import { i18n } from '@lingui/core';
import './restore.scss';
import { useNavigate } from 'react-router-dom';

function formatSecret(secret) {
    const parts = secret.match(/.{1,4}/g);
    if (parts === null) return secret;
    return parts.join('  ');
}

class LoadBackupForm extends Form {
    validate() {
        const errors = {};
        const { data } = this;
        if (data.secret !== undefined)
            data.secret = data.secret
                .toLowerCase()
                .replace(/[^abcdefghijkmnpqrstuvwxyz23456789]/g, '');
        if (!/[abcdefghijkmnpqrstuvwxyz23456789]{16,20}/i.exec(data.secret))
            errors.secret = i18n._('load-backup.invalid-secret');
        return errors;
    }
}

export default withForm(
    withActions(
        ({
            form: { set, data, error, valid, reset },
            restoreFromBackup,
            restoreFromBackupAction,
        }) => {
            const [initialized, setInitialized] = useState(false);
            const [restoring, setRestoring] = useState(false);
            const navigate = useNavigate();

            useEffect(() => {
                if (initialized) return;
                setInitialized(true);
            });

            const restore = () => {
                setRestoring(true);
                restoreFromBackupAction(data.secret).then(data => {
                    setRestoring(false);
                    if (data.status === 'succeeded')
                        navigate('/user/appointments');
                });
            };

            let notice;
            if (
                restoreFromBackup !== undefined &&
                restoreFromBackup.status === 'failed'
            )
                notice = (
                    <Message type="danger">
                        <Trans id="load-backup.failed" />
                    </Message>
                );

            return (
                <CenteredCard className="kip-user-restore-from-backup">
                    <CardHeader>
                        <h1 className="bulma-subtitle">
                            <Trans id="load-backup.title" />
                        </h1>
                    </CardHeader>
                    <CardContent>
                        {notice}
                        <FormComponent>
                            <FieldSet>
                                <RetractingLabelInput
                                    id="secret"
                                    value={formatSecret(data.secret || '')}
                                    onChange={value => set('secret', value)}
                                    label={
                                        <Trans id="load-backup.secret.label" />
                                    }
                                    description={
                                        <Trans id="load-backup.secret.description" />
                                    }
                                />
                            </FieldSet>
                        </FormComponent>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={restore}
                            type="success"
                            disabled={!valid || restoring}
                        >
                            <Trans id="load-backup.load" />
                        </Button>
                    </CardFooter>
                </CenteredCard>
            );
        },
        [restoreFromBackup]
    ),
    LoadBackupForm,
    'form'
);
