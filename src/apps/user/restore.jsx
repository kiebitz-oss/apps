// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, useRef } from 'react';
import {
    withActions,
    withSettings,
    withRouter,
    withForm,
    CenteredCard,
    ErrorFor,
    Button,
    RetractingLabelInput,
    Message,
    CardContent,
    CardHeader,
    CardFooter,
    Form as FormComponent,
    FieldSet,
    A,
    T,
} from 'components';
import { restoreFromBackup } from 'apps/user/actions';
import t from './translations.yml';
import Form from 'helpers/form';
import './restore.scss';

function formatSecret(secret){
    const parts = secret.match(/.{1,4}/g)
    if (parts === null)
        return secret
    return parts.join("  ")
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
            errors.secret = this.settings.t(t, 'load-backup.invalid-secret');
        return errors;
    }
}

export default withForm(
    withActions(
        withRouter(
            withSettings(
                ({
                    form: { set, data, error, valid, reset },
                    restoreFromBackup,
                    restoreFromBackupAction,
                    router,
                    settings,
                }) => {
                    const [initialized, setInitialized] = useState(false);
                    const [restoring, setRestoring] = useState(false);

                    useEffect(() => {
                        if (initialized) return;
                        setInitialized(true);
                    });

                    const restore = () => {
                        setRestoring(true);
                        restoreFromBackupAction(data.secret).then(data => {
                            setRestoring(false);
                            if (data.status === 'succeeded')
                                router.navigateToUrl('/user/appointments');
                        });
                    };

                    let notice;
                    if (
                        restoreFromBackup !== undefined &&
                        restoreFromBackup.status === 'failed'
                    )
                        notice = (
                            <Message type="danger">
                                <T t={t} k="load-backup.failed" />
                            </Message>
                        );

                    return (
                        <CenteredCard className="kip-restore-from-backup">
                            <CardHeader>
                                <h1 className="bulma-subtitle">
                                    <T t={t} k="load-backup.title" />
                                </h1>
                            </CardHeader>
                            <CardContent>
                                {notice}
                                <FormComponent>
                                    <FieldSet>
                                        <RetractingLabelInput
                                            id="secret"
                                            value={formatSecret(data.secret || '')}
                                            onChange={value =>
                                                set('secret', value)
                                            }
                                            label={
                                                <T
                                                    t={t}
                                                    k="load-backup.secret.label"
                                                />
                                            }
                                            description={
                                                <T
                                                    t={t}
                                                    k="load-backup.secret.description"
                                                />
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
                                    <T t={t} k="load-backup.load" />
                                </Button>
                            </CardFooter>
                        </CenteredCard>
                    );
                }
            )
        ),
        [restoreFromBackup]
    ),
    LoadBackupForm,
    'form'
);
