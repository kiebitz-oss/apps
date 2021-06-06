// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { memo, useState, useEffect, Fragment as F } from 'react';
import Form from 'helpers/form';
import {
    withRouter,
    withSettings,
    withForm,
    withActions,
    WithLoader,
    Form as FormComponent,
    FieldSet,
    Modal,
    RetractingLabelInput,
    DropdownMenu,
    DropdownMenuItem,
    Icon,
    ErrorFor,
    T,
    CardFooter,
    CardContent,
    SubmitField,
    Button,
} from 'components';
import { ProviderData } from '../setup/verify';
import { DataSecret } from '../setup/store-secrets';
import { str2ab } from 'helpers/conversion';
import {
    keys,
    keyPairs,
    providerData,
    providerSecret,
    encryptBackupData,
    verifiedProviderData,
} from '../actions';
import t from './translations.yml';
import './settings.scss';
import { copyToClipboard } from '../../../helpers/clipboard';

const Settings = withActions(
    withRouter(
        withActions(
            withSettings(
                ({
                    action,
                    type,
                    settings,
                    keys,
                    keysAction,
                    keyPairs,
                    keyPairsAction,
                    providerSecret,
                    providerSecretAction,
                    providerData,
                    providerDataAction,
                    encryptBackupData,
                    encryptBackupDataAction,
                    verifiedProviderData,
                    verifiedProviderDataAction,
                    router,
                }) => {
                    const [deleting, setDeleting] = useState(false);
                    const [backingUp, setBackingUp] = useState(false);
                    const [loggingOut, setLoggingOut] = useState(false);
                    const [initialized, setInitialized] = useState(false);
                    const [view, setView] = useState('verified');

                    // we load all the resources we need
                    useEffect(() => {
                        if (initialized) return;

                        keyPairsAction().then(kp =>
                            providerSecretAction().then(ps =>
                                encryptBackupDataAction(kp.data, ps.data)
                            )
                        );

                        keysAction();
                        verifiedProviderDataAction();
                        providerDataAction();

                        setInitialized(true);
                    });

                    let modal;

                    const backupData = () => {
                        const a = document.createElement('a');
                        a.download = 'kiebitz-backup-data.enc';
                        a.href = URL.createObjectURL(blob);
                        document.body.appendChild(a);
                        a.click();
                        router.navigateToUrl('/provider/settings');
                    };

                    const cancel = () => {
                        router.navigateToUrl('/provider/settings');
                    };

                    const deleteData = () => {
                        setDeleting(true);
                        const backend = settings.get('backend');
                        backend.local.deleteAll('provider::');
                        setTimeout(() => {
                            setDeleting(false);
                            router.navigateToUrl('/provider/deleted');
                        }, 3000);
                    };

                    const logOut = () => {
                        setLoggingOut(true);
                        const backend = settings.get('backend');
                        backend.local.deleteAll('provider::');
                        setTimeout(() => {
                            setLoggingOut(false);
                            router.navigateToUrl('/provider/logged-out');
                        }, 3000);
                    };

                    let blob;

                    if (
                        encryptBackupData !== undefined &&
                        encryptBackupData.status === 'succeeded'
                    ) {
                        blob = new Blob(
                            [str2ab(JSON.stringify(encryptBackupData.data))],
                            {
                                type: 'application/octet-stream',
                            }
                        );
                    }

                    if (action === 'backup') {
                        modal = (
                            <Modal
                                onClose={cancel}
                                save="Sicherungsdatei herunterladen"
                                disabled={backingUp}
                                waiting={backingUp}
                                title={<T t={t} k="backup-modal.title" />}
                                onCancel={cancel}
                                onSave={backupData}
                                saveType="success"
                            >
                                <p>
                                    <T
                                        t={t}
                                        k={
                                            backingUp
                                                ? 'backup-modal.backing-up-text'
                                                : 'backup-modal.text'
                                        }
                                    />
                                </p>
                                <hr />
                                <DataSecret
                                    secret={providerSecret.data}
                                    embedded={true}
                                    hideNotice={true}
                                />
                                <Button
                                    style={{ marginRight: '1em' }}
                                    type="success"
                                    onClick={() =>
                                        copyToClipboard(providerSecret.data)
                                    }
                                >
                                    Datenschlüssel kopieren
                                </Button>
                            </Modal>
                        );
                    } else if (action === 'delete') {
                        modal = (
                            <Modal
                                onClose={cancel}
                                save={<T t={t} k="delete" />}
                                disabled={deleting}
                                waiting={deleting}
                                title={<T t={t} k="delete-modal.title" />}
                                onCancel={cancel}
                                onSave={deleteData}
                                saveType="danger"
                            >
                                <p>
                                    <T
                                        t={t}
                                        k={
                                            deleting
                                                ? 'delete-modal.deleting-text'
                                                : 'delete-modal.text'
                                        }
                                    />
                                </p>
                            </Modal>
                        );
                    } else if (action === 'logout') {
                        modal = (
                            <Modal
                                onClose={cancel}
                                save={<T t={t} k="log-out" />}
                                disabled={loggingOut}
                                waiting={loggingOut}
                                title={<T t={t} k="log-out-modal.title" />}
                                onCancel={cancel}
                                onSave={logOut}
                                saveType="warning"
                            >
                                <p>
                                    <T
                                        t={t}
                                        k={
                                            loggingOut
                                                ? 'log-out-modal.logging-out'
                                                : 'log-out-modal.text'
                                        }
                                    />
                                </p>
                                <hr />
                                <DataSecret
                                    secret={providerSecret.data}
                                    embedded={true}
                                    hideNotice={true}
                                />
                                <Button
                                    style={{ marginRight: '1em' }}
                                    type="success"
                                    onClick={() =>
                                        copyToClipboard(providerSecret.data)
                                    }
                                >
                                    Datenschlüssel kopieren
                                </Button>
                                <a
                                    className="bulma-button bulma-is-success"
                                    download=" kiebitz-backup-data.enc"
                                    href={URL.createObjectURL(blob)}
                                >
                                    Sicherungsdatei herunterladen
                                </a>
                            </Modal>
                        );
                    }

                    const render = () => {
                        return (
                            <div className="kip-provider-settings">
                                {modal}
                                <CardContent>
                                    <h2>
                                        <T t={t} k="provider-data.title" />
                                    </h2>

                                    <p style={{ marginBottom: '1em' }}>
                                        <T
                                            t={t}
                                            k="provider-data.verified-vs-unverifired-desc"
                                        />
                                    </p>

                                    <DropdownMenu
                                        title={
                                            <F>
                                                <Icon icon="calendar" />{' '}
                                                <T
                                                    t={t}
                                                    k={`settings.${view}`}
                                                />
                                            </F>
                                        }
                                    >
                                        <DropdownMenuItem
                                            icon="calendar"
                                            onClick={() => setView('verified')}
                                        >
                                            <T t={t} k={`settings.verified`} />
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            icon="list"
                                            onClick={() => setView('local')}
                                        >
                                            <T t={t} k={`settings.local`} />
                                        </DropdownMenuItem>
                                    </DropdownMenu>
                                    <ProviderData
                                        providerData={
                                            view === 'verified'
                                                ? verifiedProviderData
                                                : providerData
                                        }
                                        verified={view === 'verified'}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <div className="kip-buttons">
                                        <Button
                                            type="success"
                                            href="/provider/settings/backup"
                                        >
                                            <T t={t} k="backup" />
                                        </Button>
                                        <Button
                                            type="warning"
                                            href="/provider/settings/logout"
                                        >
                                            <T t={t} k="log-out" />
                                        </Button>
                                        <Button
                                            type="danger"
                                            href="/provider/settings/delete"
                                        >
                                            <T t={t} k="delete" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </div>
                        );
                    };

                    // we wait until all resources have been loaded before we display the form
                    return (
                        <WithLoader
                            resources={[
                                keyPairs,
                                providerData,
                                verifiedProviderData,
                            ]}
                            renderLoaded={render}
                        />
                    );
                }
            ),
            [providerSecret, encryptBackupData, keyPairs]
        )
    ),
    [keys, providerData, keyPairs, verifiedProviderData, providerSecret]
);

export default Settings;
