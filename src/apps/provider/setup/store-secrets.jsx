// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';
import { b642buf } from 'helpers/conversion';
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
import { providerSecret } from '../actions';
import t from './translations.yml';
import './store-secrets.scss';

// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData('Text', text);
    } else if (
        document.queryCommandSupported &&
        document.queryCommandSupported('copy')
    ) {
        const textarea = document.createElement('textarea');
        textarea.textContent = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand('copy'); // Security exception may be thrown by some browsers.
        } catch (ex) {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

export const StoreOnline = ({ settings, secret, embedded, hideNotice }) => {
    const [succeeded, setSucceeded] = useState(false);
    const [failed, setFailed] = useState(false);

    const chunks = secret.match(/.{1,4}/g);

    let fragments = [];
    for (let i = 0; i < chunks.length; i++) {
        fragments.push(<F>{chunks[i]}</F>);
        if (i < chunks.length - 1)
            fragments.push(<strong style={{ userSelect: 'none' }}>·</strong>);
    }

    const copy = () => {
        if (!copyToClipboard(secret)) setFailed(true);
        else setSucceeded(true);
    };

    return (
        <React.Fragment>
            {!embedded && (
                <p className="kip-secrets-notice">
                    <T t={t} k="store-secrets.online.text" />
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
        withSettings(({ settings, router, providerSecret, status }) => {
            const [url, setUrl] = useState(null);

            const date = new Date().toLocaleDateString();
            const data = 'data';
            const blob = new Blob([b642buf(data)], {
                type: 'application/octet-stream',
            });

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
                            <T t={t} k="store-secrets.secrets-modal.title" />
                        }
                        onClose={hideSecrets}
                        save={<T t={t} k="wizard.leave" />}
                        onSave={goToDashboard}
                        onCancel={hideSecrets}
                        saveType="success"
                    >
                        <StoreOnline
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
                    <CardFooter>
                        <a
                            onClick={showSecrets}
                            className="bulma-button bulma-is-success"
                            download="geheime-daten.kiebitz"
                            href={URL.createObjectURL(blob)}
                            type="success"
                        >
                            <T t={t} k="wizard.store-secrets" />
                        </a>
                    </CardFooter>
                </React.Fragment>
            );
        }),
        [providerSecret]
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