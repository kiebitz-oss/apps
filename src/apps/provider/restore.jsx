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
    CardFooter,
    Form as FormComponent,
    FieldSet,
    A,
    T,
} from 'components';
import { restoreFromBackup } from 'apps/provider/actions';
import t from './translations.yml';
import Form from 'helpers/form';
import './restore.scss';

class LoadBackupForm extends Form {
    validate() {
        const errors = {};
        const { data } = this;
        if (!data.file)
            errors.file = this.settings.t(t, 'load-backup.missing-file');
        else if (data.file.data === undefined || data.file.iv === undefined)
            errors.file = this.settings.t(t, 'load-backup.invalid-file', {
                title: this.settings.get('title'),
            });
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
                    const fileInput = useRef(null);
                    useEffect(() => {
                        if (initialized) return;
                        setInitialized(true);
                    });

                    const keyDown = e => {
                        if (e.which === 13 || e.which === 23)
                            fileInput.current.click();
                    };

                    const restore = () => {
                        setRestoring(true);
                        restoreFromBackupAction(data.secret, data.file).then(
                            data => {
                                setRestoring(false);
                                if (data.status === 'succeeded')
                                    router.navigateToUrl('/provider/schedule');
                            }
                        );
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

                    const readFile = e => {
                        const file = e.target.files[0];
                        var reader = new FileReader();

                        set('filename', file.name);

                        reader.onload = function(e) {
                            try {
                                const json = JSON.parse(e.target.result);
                                set('file', json);
                            } catch (e) {
                                set('file', undefined);
                            }
                        };

                        reader.readAsBinaryString(file);
                    };

                    return (
                        <CenteredCard className="kip-restore-from-backup">
                            <CardContent>
                                <h1 className="bulma-subtitle">
                                    <T t={t} k="load-backup.title" />
                                </h1>
                                {notice}
                                <FormComponent>
                                    <FieldSet>
                                        <ErrorFor
                                            error={error}
                                            field="secret"
                                        />
                                        <RetractingLabelInput
                                            value={data.secret || ''}
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
                                        <h2>
                                            <T
                                                t={t}
                                                k="load-backup.input.label"
                                            />
                                        </h2>
                                        <ErrorFor error={error} field="file" />
                                        <label
                                            role="button"
                                            onKeyDown={keyDown}
                                            tabIndex="0"
                                            htmlFor="file-upload"
                                            className="kip-custom-file-upload"
                                        >
                                            <input
                                                ref={fileInput}
                                                id="file-upload"
                                                className="bulma-input"
                                                type="file"
                                                role="button"
                                                onChange={e => readFile(e)}
                                            />
                                            {(data.file !== undefined && (
                                                <T
                                                    t={t}
                                                    k="load-backup.input.change"
                                                    filename={data.filename}
                                                />
                                            )) || (
                                                <T
                                                    t={t}
                                                    k="load-backup.input"
                                                />
                                            )}
                                        </label>
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
