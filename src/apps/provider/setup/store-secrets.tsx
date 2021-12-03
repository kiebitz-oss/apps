// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';
import { str2ab } from 'helpers/conversion';
import {
    Modal,
    withActions,
    Message,
    CardContent,
    CardFooter,
    Button,
    A,
} from 'components';
import { providerSecret, providerData, keyPairs, backupData } from '../actions';
import { Trans } from '@lingui/macro';
import './store-secrets.scss';

import { copyToClipboard } from '../../../helpers/clipboard';
import { useNavigate } from 'react-router-dom';

export const DataSecret: React.FC<any> = ({ secret, embedded, hideNotice }) => {
    const [succeeded, setSucceeded] = useState(false);
    const [failed, setFailed] = useState(false);

    const chunks = secret.match(/.{1,4}/g);

    const fragments = [];
    for (let i = 0; i < chunks.length; i++) {
        fragments.push(<F key={`${i}-main`}>{chunks[i]}</F>);
        if (i < chunks.length - 1)
            fragments.push(
                <strong key={`${i}-dot`} style={{ userSelect: 'none' }}>
                    ·
                </strong>
            );
    }

    const copy = () => {
        if (!copyToClipboard(secret)) setFailed(true);
        else setSucceeded(true);
    };

    return (
        <>
            {!embedded && (
                <p className="kip-secrets-notice">
                    <Trans id="store-secrets.online.text" safe>
                        Bitte notieren Sie Ihren Datenschlüssel sorgfältig! Sie
                        benötigen ihn, um sich auf einem anderen PC (Tablet,
                        Smartphone etc.) einzuloggen oder auf einem anderen
                        Endgerät auf Ihre Termine zugreifen zu können.
                    </Trans>
                </p>
            )}
            <div
                className={
                    'kip-secrets-box' + (embedded ? ' kip-is-embedded' : '')
                }
            >
                {
                    <>
                        <div className="kip-uid">
                            {!hideNotice && (
                                <span>
                                    <Trans id="store-secrets.secret">
                                        Ihr Datenschlüssel
                                    </Trans>
                                </span>
                            )}
                            <code>{fragments}</code>
                        </div>
                    </>
                }
            </div>
            {!embedded && (
                <div className="kip-secrets-links">
                    <Button
                        variant={failed ? 'danger' : 'primary'}
                        disabled={failed}
                        className="bulma-button bulma-is-small"
                        onClick={copy}
                    >
                        <Trans
                            id={
                                failed
                                    ? 'store-secrets.copy-failed'
                                    : succeeded
                                    ? 'store-secrets.copy-succeeded'
                                    : 'store-secrets.copy'
                            }
                        >
                            {failed
                                ? 'Fehlgeschlagen'
                                : succeeded
                                ? 'In der Zwischenablage'
                                : 'Kopieren'}
                        </Trans>
                    </Button>
                </div>
            )}
        </>
    );
};

function padNumber(number, n) {
    const str = `${number}`;
    if (str.length < n) return '0'.repeat(n - str.length) + str;
    return str;
}

function formatDate(date) {
    const [year, month, day, hours, minutes] = [
        date.getFullYear(),
        padNumber(date.getMonth() + 1, 2),
        padNumber(date.getDate(), 2),
        padNumber(date.getHours(), 2),
        padNumber(date.getMinutes(), 2),
    ];
    return `${year}-${month}-${day}-${hours}-${minutes}`;
}

const BackupDataLinkBase: React.FC<any> = ({
    onSuccess,
    settings,
    downloadText,
    providerData,
    keyPairsAction,
    providerSecretAction,
    backupData,
    backupDataAction,
}) => {
    const [initialized, setInitialized] = useState(false);

    let providerName;

    try {
        providerName = providerData.data.data.name
            .replaceAll(' ', '-')
            .replaceAll('.', '-')
            .toLowerCase();
    } catch (e) {}

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        keyPairsAction().then((kp) =>
            providerSecretAction().then((ps) =>
                backupDataAction(kp.data, ps.data)
            )
        );
    });

    let blob;

    if (backupData !== undefined && backupData.status === 'succeeded') {
        blob = new Blob([str2ab(JSON.stringify(backupData.data))], {
            type: 'application/octet-stream',
        });
    }

    const title = settings.get('title').toLowerCase();

    const dateString = formatDate(new Date());

    const filename = `${title}-backup-${dateString}-${providerName}.enc`;

    if (blob !== undefined)
        return (
            <A
                onClick={onSuccess}
                type="button"
                download={filename}
                href={URL.createObjectURL(blob)}
                variant="success"
            >
                {downloadText || (
                    <Trans id="wizard.download-backup-data">
                        Sicherungsdatei herunterladen und Datenschlüssel
                        notieren
                    </Trans>
                )}
            </A>
        );

    return (
        <Message waiting type="warning">
            <Trans id="wizard.generating-backup-data">
                Bitte warten, erstelle Backup-Daten...
            </Trans>
        </Message>
    );
};

export const BackupDataLink = withActions(BackupDataLinkBase, [
    providerSecret,
    backupData,
    keyPairs,
    providerData,
]);

const StoreSecretsPage: React.FC<any> = ({ providerSecret, status }) => {
    const navigate = useNavigate();

    const goToDashboard = () => {
        navigate('/provider');
    };

    const showSecrets = () => {
        navigate('/provider/setup/store-secrets/show');
    };

    const hideSecrets = () => {
        navigate('/provider/setup/store-secrets');
    };

    let modal;

    if (status === 'show')
        modal = (
            <Modal
                title={
                    <Trans id="store-secrets.secrets-modal.title">
                        Bitte Datenschlüssel notieren!
                    </Trans>
                }
                onClose={hideSecrets}
                save={
                    <Trans id="wizard.leave">
                        Abschließen & zur Terminplanung
                    </Trans>
                }
                onSave={goToDashboard}
                onCancel={hideSecrets}
                saveType="success"
            >
                <DataSecret secret={providerSecret.data} />
            </Modal>
        );

    return (
        <>
            {modal}
            <CardContent className="kip-secrets">
                <p>
                    <Trans id="store-secrets.notice">
                        Um sich auf einem anderen PC (Tablet, Smartphone etc.)
                        einzuloggen oder auf einem anderen Endgerät auf Ihre
                        Termine zugreifen zu können, benötigen Sie Ihre
                        Sicherungsdatei und Ihren Datenschlüssel. Bitte
                        erstellen Sie jetzt Ihre Sicherungsdatei und notieren
                        Sie sich im Anschluss den Datenschlüssel.
                    </Trans>
                </p>
            </CardContent>
            <CardFooter>
                <BackupDataLink onSuccess={showSecrets} />
            </CardFooter>
        </>
    );
};

export default withActions(StoreSecretsPage, [providerSecret]);
