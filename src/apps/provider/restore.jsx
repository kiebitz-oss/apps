// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, useRef, Fragment as F } from 'react';
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
    Switch,
    CardContent,
    CardFooter,
    Form as FormComponent,
    FieldSet,
    A,
    T,
} from 'components';
import { restoreFromBackup } from 'apps/provider/actions';
import { t, Trans } from '@lingui/macro';
import Form from 'helpers/form';
import './restore.scss';

class LoadBackupForm extends Form {
    validate() {
        const errors = {};
        const { data } = this;
        if (!data.file)
            errors.file = t({ id: 'load-backup.missing-file', message: "load-backup.missing-file MISSING" });
        else if (data.file.data === undefined || data.file.iv === undefined)
            errors.file = t({ id: 'load-backup.invalid-file', message: "load-backup.invalid-file MISSING" });
        if (data.secret !== undefined)
            data.secret = data.secret
                .toLowerCase()
                .replace(/[^abcdefghijkmnpqrstuvwxyz23456789]/g, '');
        if (!/[abcdefghijkmnpqrstuvwxyz23456789]{16,20}/i.exec(data.secret))
            errors.secret = t({ id: 'load-backup.invalid-secret', message: "load-backup.invalid-secret MISSING" });

        return errors;
    }
}

function formatSecret(secret) {
    const parts = secret.match(/.{1,4}/g);
    if (parts === null) return secret;
    return parts.join('  ');
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
                        restoreFromBackupAction(
                            data.secret,
                            data.file,
                            data.localOnly
                        ).then(data => {
                            setRestoring(false);
                            if (data.status === 'succeeded')
                                router.navigateToUrl('/provider/schedule');
                        });
                    };

                    let notice;
                    if (
                        restoreFromBackup !== undefined &&
                        restoreFromBackup.status === 'failed'
                    )
                        notice = (
                            <Message type="danger">
                                <Trans id="load-backup.failed">
                                    Das Laden Ihrer Daten ist leider fehlgeschlagen. Bitte prüfen Sie Ihren Datenschlüssel sowie die angegebene Datei.
                                </Trans>
                            </Message>
                        );

                    const readFile = e => {
                        const file = e.target.files[0];
                        const reader = new FileReader();

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
                        <CenteredCard className="kip-provider-restore-from-backup">
                            <CardContent>
                                <h1 className="bulma-subtitle">
                                    <Trans id="load-backup.title">Einloggen</Trans>
                                </h1>
                                {notice}
                                <FormComponent>
                                    <FieldSet>
                                        <RetractingLabelInput
                                            id="secret"
                                            value={formatSecret(
                                                data.secret || ''
                                            )}
                                            onChange={value =>
                                                set('secret', value)
                                            }
                                            label={
                                                <Trans id="load-backup.secret.label">Datenschlüssel</Trans>
                                            }
                                            description={
                                                <Trans id="load-backup.secret.description">
                                                    Der Datenschlüssel, den Sie bei der Registrierung erhalten haben.
                                                </Trans>
                                            }
                                        />
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
                                                <Trans id="load-backup.input.change">{data.filename}</Trans>
                                            )) || (
                                                <Trans id="load-backup.input">Sicherungsdatei wählen</Trans>
                                            )}
                                        </label>
                                        <span className="kip-retracting-label-input">
                                            <p className="kip-description">
                                                <Trans id="load-backup.input.description">
                                                    Bitte laden Sie hier Ihre Sicherungsdatei (booster-impfen-backup-2021[Datum&Uhrzeit].enc) hoch.
                                                </Trans>
                                            </p>
                                        </span>
                                        {false && (
                                            <F>
                                                <h3>
                                                    <Trans id="load-backup.advanced-options">Erweiterte Optionen</Trans>
                                                </h3>
                                                <ul className="kip-properties">
                                                    <li className="kip-property">
                                                        <Switch
                                                            id="localOnly"
                                                            checked={
                                                                data.localOnly !==
                                                                undefined
                                                                    ? data.localOnly
                                                                    : false
                                                            }
                                                            onChange={value =>
                                                                set(
                                                                    'localOnly',
                                                                    value
                                                                )
                                                            }
                                                        >
                                                            &nbsp;
                                                        </Switch>

                                                        <label htmlFor="localOnly">
                                                            <Trans id="load-backup.local-only.label">Nur lokale Daten laden (keine Cloud-Daten)</Trans>
                                                        </label>
                                                    </li>
                                                </ul>
                                            </F>
                                        )}
                                    </FieldSet>
                                </FormComponent>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={restore}
                                    type="success"
                                    disabled={!valid || restoring}
                                >
                                    <Trans id="load-backup.load">Einloggen</Trans>
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
