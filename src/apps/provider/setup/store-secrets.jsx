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
import { providerSecret, keyPairs, encryptBackupData } from '../actions';
import t from './translations.yml';
import './store-secrets.scss';

import { copyToClipboard} from '../../../helpers/clipboard';

export const DataSecret = ({ settings, secret, embedded, hideNotice }) => {
    const [succeeded, setSucceeded] = useState(false);
    const [failed, setFailed] = useState(false);

    const chunks = secret.match(/.{1,4}/g);

    let fragments = [];
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
                    <T t={t} k="store-secrets.online.text" safe />
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
                                    <T t={t} k="store-secrets.secret" />
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
                        type={failed ? 'danger' : succeeded ? '' : 'primary'}
                        disabled={failed}
                        className="bulma-button bulma-is-small"
                        onClick={copy}
                    >
                        <T
                            t={t}
                            k={
                                failed
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
};

export default withRouter(
    withActions(
        withSettings(
            ({
                settings,
                keyPairs,
                keyPairsAction,
                router,
                providerSecret,
                providerSecretAction,
                encryptBackupData,
                encryptBackupDataAction,
                status,
            }) => {
                const [url, setUrl] = useState(null);
                const [initialized, setInitialized] = useState(false);

                useEffect(() => {
                    if (initialized) return;
                    setInitialized(true);
                    keyPairsAction().then(kp =>
                        providerSecretAction().then(ps =>
                            encryptBackupDataAction(kp.data, ps.data)
                        )
                    );
                });

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

                const showSecrets = () => {
                    router.navigateToUrl('/provider/setup/store-secrets/show');
                };

                const hideSecrets = () => {
                    router.navigateToUrl('/provider/setup/store-secrets');
                };

                const goToDashboard = () => {
                    router.navigateToUrl('/provider');
                };

                let modal;

                if (status === 'show')
                    modal = (
                        <Modal
                            title={
                                <T
                                    t={t}
                                    k="store-secrets.secrets-modal.title"
                                />
                            }
                            onClose={hideSecrets}
                            save={<T t={t} k="wizard.leave" />}
                            onSave={goToDashboard}
                            onCancel={hideSecrets}
                            saveType="success"
                        >
                            <DataSecret
                                settings={settings}
                                secret={providerSecret.data}
                            />
                        </Modal>
                    );

                return (
                    <React.Fragment>
                        {modal}
                        <CardContent className="kip-secrets">
                            <p>
                                <T t={t} k="store-secrets.notice" />
                            </p>
                        </CardContent>
                        {(blob !== undefined && (
                            <CardFooter>
                                <a
                                    onClick={showSecrets}
                                    className="bulma-button bulma-is-success"
                                    download="kiebitz-backup-data.enc"
                                    href={URL.createObjectURL(blob)}
                                    type="success"
                                >
                                    <T t={t} k="wizard.download-backup-data" />
                                </a>
                            </CardFooter>
                        )) || (
                            <Message waiting type="warning">
                                <T t={t} k="wizard.generating-backup-data" />
                            </Message>
                        )}
                    </React.Fragment>
                );
            }
        ),
        [providerSecret, encryptBackupData, keyPairs]
    )
);

/*
    <Switch
        onChange={() =>
            setTab(tab === 'online' ? 'local' : 'online')
        }
    >
        <T t={t} k={`store-secrets.${tab}.title`} />
    </Switch>
*/
