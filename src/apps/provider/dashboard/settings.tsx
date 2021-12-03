// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import {
    withActions,
    WithLoader,
    Modal,
    DropdownMenu,
    DropdownMenuItem,
    Icon,
    CardFooter,
    CardContent,
    Button,
    A,
} from 'components';
import { ProviderData } from '../setup/verify';
import { BackupDataLink } from '../setup/store-secrets';
import { DataSecret } from '../setup/store-secrets';
import {
    keys,
    keyPairs,
    backupData,
    providerData,
    providerSecret,
    verifiedProviderData,
} from '../actions';
import { Trans, defineMessage } from '@lingui/macro';
import './settings.scss';
import { copyToClipboard } from '../../../helpers/clipboard';
import { useNavigate } from 'react-router-dom';
import { useBackend } from 'hooks';

const settingsMessages = {
    verified: defineMessage({
        id: 'settings.verified',
        message: 'Verifizierte Daten',
    }),
    local: defineMessage({
        id: 'settings.local',
        message: 'Unverifizierte Daten',
    }),
};

const SettingsPage: React.FC<any> = ({
    action,
    keysAction,
    keyPairs,
    keyPairsAction,
    providerSecret,
    providerSecretAction,
    backupDataAction,
    providerData,
    providerDataAction,
    verifiedProviderData,
    verifiedProviderDataAction,
}) => {
    const [deleting, setDeleting] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [view, setView] = useState('verified');
    const navigate = useNavigate();
    const backend = useBackend();

    // we load all the resources we need
    useEffect(() => {
        if (initialized) return;

        keysAction();
        verifiedProviderDataAction();
        providerDataAction();

        setInitialized(true);
    });

    let modal;

    const cancel = () => {
        navigate('/provider/settings');
    };

    const deleteData = () => {
        setDeleting(true);

        backend.local.deleteAll('provider::');
        setDeleting(false);
        navigate('/provider/deleted');
    };

    const logOut = () => {
        setLoggingOut(true);

        const kpa = keyPairsAction('logoutKeyPairs');
        kpa.then((kp) => {
            const psa = providerSecretAction(undefined, 'logoutProviderSecret');
            psa.then((ps) => {
                // we give the backup data action a different name to avoid it being rejected
                // in case there's already a backup in progress... It will still be queued
                // up to ensure no conflicts can occur.
                const ba = backupDataAction(kp.data, ps.data, 'logout');
                ba.then(() => {
                    backend.local.deleteAll('provider::');
                    navigate('/provider/logged-out');
                });
                ba.catch(() => setLoggingOut(false));
            });
            psa.catch(() => setLoggingOut(false));
        });
        kpa.catch(() => setLoggingOut(false));
    };

    if (action === 'backup') {
        modal = (
            <Modal
                onClose={cancel}
                save="Sicherungsdatei herunterladen"
                title={
                    <Trans id="backup-modal.title">
                        Datenbackup anfertigen
                    </Trans>
                }
                onCancel={cancel}
                cancel={<Trans id="backup-modal.close">Schließen</Trans>}
                saveType="success"
            >
                <p>
                    <Trans id="backup-modal.text">
                        Klicken Sie auf "Datenbackup anfertigen" um eine
                        verschlüsselte Datei mit Ihren Einstellungen und
                        Termindaten zu erzeugen. Bitte denken Sie daran, den
                        Datenschlüssel zu notieren, ohne diesen sind die Daten
                        nicht wiederherstellbar.
                    </Trans>
                </p>
                <hr />
                <DataSecret
                    secret={providerSecret.data}
                    embedded={true}
                    hideNotice={true}
                />
                <Button
                    style={{ marginRight: '1em' }}
                    variant="success"
                    onClick={() => copyToClipboard(providerSecret.data)}
                >
                    Datenschlüssel kopieren
                </Button>
                <BackupDataLink
                    downloadText={
                        <Trans id="backup-modal.download-backup">
                            Sicherungsdatei herunterladen
                        </Trans>
                    }
                    onSuccess={cancel}
                />
            </Modal>
        );
    } else if (action === 'delete') {
        modal = (
            <Modal
                onClose={cancel}
                save={<Trans id="delete">Konto löschen</Trans>}
                disabled={deleting}
                waiting={deleting}
                title={
                    <Trans id="delete-modal.title">Nutzer-Daten löschen</Trans>
                }
                onCancel={cancel}
                onSave={deleteData}
                saveType="danger"
            >
                <p>
                    <Trans
                        id={
                            deleting
                                ? 'delete-modal.deleting-text'
                                : 'delete-modal.text'
                        }
                    >
                        {deleting
                            ? 'Bitte warten, Ihre Daten werden gelöscht. Sie werden nach der Löschung auf die Startseite umgeleitet.'
                            : 'Möchten Sie Ihre Daten wirklich unwiderruflich löschen?'}
                    </Trans>
                </p>
            </Modal>
        );
    } else if (action === 'logout') {
        modal = (
            <Modal
                onClose={cancel}
                save={<Trans id="log-out">Abmelden</Trans>}
                disabled={loggingOut}
                waiting={loggingOut}
                title={<Trans id="log-out-modal.title">Abmelden</Trans>}
                onCancel={cancel}
                onSave={logOut}
                saveType="warning"
            >
                <p>
                    <Trans
                        id={
                            loggingOut
                                ? 'log-out-modal.logging-out'
                                : 'log-out-modal.text'
                        }
                    >
                        {loggingOut
                            ? 'Bitte warten, Sie werden abgemeldet...'
                            : 'Möchten Sie sich wirklich abmelden? Bitte stellen Sie sicher, dass Sie Ihren Datenschlüssel notiert und Ihre Sicherungsdatei heruntergeladen haben . Nur damit können Sie sich erneut einloggen.'}
                    </Trans>
                </p>
                <hr />
                <DataSecret
                    secret={providerSecret.data}
                    embedded={true}
                    hideNotice={true}
                />
                <Button
                    style={{ marginRight: '1em' }}
                    variant="success"
                    onClick={() => copyToClipboard(providerSecret.data)}
                >
                    Datenschlüssel kopieren
                </Button>
                <BackupDataLink
                    downloadText={
                        <Trans id="backup-modal.download-backup">
                            Sicherungsdatei herunterladen
                        </Trans>
                    }
                />
            </Modal>
        );
    }

    const render = () => {
        return (
            <div className="kip-provider-settings">
                {modal}
                <CardContent>
                    <h2>
                        <Trans id="provider-data.title">Ihre Daten</Trans>
                    </h2>

                    <p style={{ marginBottom: '1em' }}>
                        <Trans id="provider-data.verified-vs-unverifired-desc">
                            Ihre Daten unterlaufen einer Überprüfung
                            unsererseits. Sobald Ihre Daten überprüft wurden,
                            werden Sie Impfwilligen angezeigt. Führen Sie nach
                            der Überprüfung Ihrer Daten noch Änderungen dieser
                            durch, so müssen diese erneut Überprüft werden und
                            werden entsprechend erst nach erfolgreicher
                            Überprüfung Impfwilligen angezeigt. Daher
                            differenzieren wir zwischen verifizierten und
                            unverifizierten Daten.
                        </Trans>
                    </p>

                    <DropdownMenu
                        title={
                            <>
                                <Icon icon="calendar" />{' '}
                                <Trans id={settingsMessages[view]} />
                            </>
                        }
                    >
                        <DropdownMenuItem
                            icon="calendar"
                            onClick={() => setView('verified')}
                        >
                            <Trans id="settings.verified">
                                Verifizierte Daten
                            </Trans>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            icon="list"
                            onClick={() => setView('local')}
                        >
                            <Trans id="settings.local">
                                Unverifizierte Daten
                            </Trans>
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
                        <A
                            type="button"
                            variant="success"
                            href="/provider/settings/backup"
                        >
                            <Trans id="backup">Datenbackup anfertigen</Trans>
                        </A>
                        <A
                            type="button"
                            variant="warning"
                            href="/provider/settings/logout"
                        >
                            <Trans id="log-out">Abmelden</Trans>
                        </A>
                        {false && (
                            <A
                                type="button"
                                variant="danger"
                                href="/provider/settings/delete"
                            >
                                <Trans id="delete">Konto löschen</Trans>
                            </A>
                        )}
                    </div>
                </CardFooter>
            </div>
        );
    };

    // we wait until all resources have been loaded before we display the form
    return (
        <WithLoader
            resources={[keyPairs, providerData, verifiedProviderData]}
            renderLoaded={render}
        />
    );
};

export default withActions(SettingsPage, [
    keys,
    providerData,
    backupData,
    keyPairs,
    verifiedProviderData,
    providerSecret,
]);
