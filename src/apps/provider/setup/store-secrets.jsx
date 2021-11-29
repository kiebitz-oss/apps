// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';
import { str2ab } from 'helpers/conversion';
import {
    Modal,
    withRouter,
    withActions,
    withSettings,
    Message,
    Switch,
    CardContent,
    CardFooter,
    Button,
    T,
    A,
} from 'components';
import { providerSecret, providerData, keyPairs, backupData } from '../actions';
import { Trans } from '@lingui/macro';
import './store-secrets.scss';

import { copyToClipboard } from '../../../helpers/clipboard';

export const DataSecret = withSettings(
    ({ settings, secret, embedded, hideNotice }) => {
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
            <React.Fragment>
                {!embedded && (
                    <p className="kip-secrets-notice">
                        <Trans id="store-secrets.online.text" safe />
                    </p>
                )}
                <div
                    className={
                        'kip-secrets-box' + (embedded ? ' kip-is-embedded' : '')
                    }
                >
                    {
                        <React.Fragment>
                            <div className="kip-uid">
                                {!hideNotice && (
                                    <span>
                                        <Trans id="store-secrets.secret" />
                                    </span>
                                )}
                                <code>{fragments}</code>
                            </div>
                        </React.Fragment>
                    }
                </div>
                {!embedded && (
                    <div className="kip-secrets-links">
                        <Button
                            type={
                                failed ? 'danger' : succeeded ? '' : 'primary'
                            }
                            disabled={failed}
                            className="bulma-button bulma-is-small"
                            onClick={copy}
                        >
                            <Trans id={failed
                                    ? 'store-secrets.copy-failed'
                                    : succeeded
                                    ? 'store-secrets.copy-succeeded'
                                    : 'store-secrets.copy'
                                }
                            />
                        </Button>
                    </div>
                )}
            </React.Fragment>
        );
    }
);

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

export const BackupDataLink = withSettings(
    withActions(
        ({
            onSuccess,
            settings,
            keyPairs,
            downloadText,
            providerData,
            keyPairsAction,
            providerSecret,
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
                keyPairsAction().then(kp =>
                    providerSecretAction().then(ps =>
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
                    <a
                        onClick={onSuccess}
                        className="bulma-button bulma-is-success"
                        download={filename}
                        href={URL.createObjectURL(blob)}
                        type="success"
                    >
                        {downloadText || (
                            <Trans id="wizard.download-backup-data" />
                        )}
                    </a>
                );

            return (
                <Message waiting type="warning">
                    <Trans id="wizard.generating-backup-data" />
                </Message>
            );
        },
        [providerSecret, backupData, keyPairs, providerData]
    )
);

export default withActions(
    withRouter(({ router, providerSecret, status }) => {
        const goToDashboard = () => {
            router.navigateToUrl('/provider');
        };

        const showSecrets = () => {
            router.navigateToUrl('/provider/setup/store-secrets/show');
        };

        const hideSecrets = () => {
            router.navigateToUrl('/provider/setup/store-secrets');
        };

        let modal;

        if (status === 'show')
            modal = (
                <Modal
                    title={<Trans id="store-secrets.secrets-modal.title" />}
                    onClose={hideSecrets}
                    save={<Trans id="wizard.leave" />}
                    onSave={goToDashboard}
                    onCancel={hideSecrets}
                    saveType="success"
                >
                    <DataSecret secret={providerSecret.data} />
                </Modal>
            );

        return (
            <React.Fragment>
                {modal}
                <CardContent className="kip-secrets">
                    <p>
                        <Trans id="store-secrets.notice" />
                    </p>
                </CardContent>
                <CardFooter>
                    <BackupDataLink onSuccess={showSecrets} />
                </CardFooter>
            </React.Fragment>
        );
    }),
    [providerSecret]
);

/*
    <Switch
        onChange={() =>
            setTab(tab === 'online' ? 'local' : 'online')
        }
    >
        <Trans id={`store-secrets.${tab}.title`} />
    </Switch>
*/
