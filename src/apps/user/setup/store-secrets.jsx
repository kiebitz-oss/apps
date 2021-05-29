// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import { b642buf } from 'helpers/conversion';
import {
    Modal,
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
import { userSecret } from 'apps/user/actions';
import t from './translations.yml';
import './store-secrets.scss';

export const StoreOnline = ({ settings, secret, embedded, hideNotice }) => {
    const [bookmarkModal, setBookmarkModal] = useState(false);
    const [copyModal, setCopyModal] = useState(false);

    let modal;

    const showBookmarkModal = () => {
        history.pushState(
            {},
            settings.t(t, 'store-secrets.restore.title'),
            `/user/restore#${secret},v0.1`
        );
        setBookmarkModal(true);
    };

    const hideBookmarkModal = () => {
        history.back();
        setBookmarkModal(false);
    };

    if (bookmarkModal)
        modal = (
            <Modal
                title={<T t={t} k="store-secrets.bookmark-modal.title" />}
                onClose={hideBookmarkModal}
            >
                <T t={t} k="store-secrets.bookmark-modal.text" />
            </Modal>
        );

    const chunks = secret.match(/.{1,4}/g);
    const readableSecret = chunks.join('·');

    return (
        <React.Fragment>
            {modal}
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
                            <code>{readableSecret}</code>
                        </div>
                    </React.Fragment>
                }
            </div>
            {!embedded && (
                <div className="kip-secrets-links">
                    <A
                        className="bulma-button bulma-is-small"
                        onClick={showBookmarkModal}
                    >
                        <T t={t} k="store-secrets.bookmark" />
                    </A>
                </div>
            )}
        </React.Fragment>
    );
};

const StoreLocal = ({ data }) => {
    const blob = new Blob([b642buf(data)], {
        type: 'application/octet-stream',
    });
    const date = new Date().toLocaleDateString();
    return (
        <React.Fragment>
            <p className="kip-secrets-notice">
                <T t={t} k="store-secrets.local.text" />
            </p>
            <a
                className="bulma-button"
                download={`geheime-daten.kiebitz`}
                href={URL.createObjectURL(blob)}
            >
                <T t={t} k="store-secrets.download" />
            </a>
        </React.Fragment>
    );
};

export default withActions(
    withSettings(({ settings, userSecret }) => {
        const [url, setUrl] = useState(null);
        const [tab, setTab] = useState('online');

        let content;

        switch (tab) {
            case 'online':
                content = (
                    <StoreOnline settings={settings} secret={userSecret.data} />
                );
                break;
            case 'local':
                content = <StoreLocal settings={settings} data={'data'} />;
                break;
        }

        return (
            <React.Fragment>
                <CardContent className="kip-secrets">{content}</CardContent>
                <CardFooter>
                    <Button type="success" href={`/user/appointments`}>
                        <T t={t} k="wizard.leave" />
                    </Button>
                </CardFooter>
            </React.Fragment>
        );
    }),
    [userSecret]
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
