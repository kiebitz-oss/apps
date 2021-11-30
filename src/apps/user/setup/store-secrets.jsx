// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';
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
import { Trans } from '@lingui/macro';
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
                title={<Trans id="store-secrets.bookmark-modal.title">
                    Lesezeichen erstellen
                </Trans>}
                onClose={hideBookmarkModal}
            >
                <Trans id="store-secrets.bookmark-modal.text">
                    Nutze Dein Browser-Menü um ein Lesezeichen für diese Seite zu erstellen. Du kannst dieses Lesezeichen öffnen, um Deinen Sicherheitscode wiederherzustellen.
                </Trans>
            </Modal>
        );

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

    return (
        <F>
            {modal}
            {!embedded && (
                <p className="kip-secrets-notice">
                    <Trans id="store-secrets.online.text" safe>
                        Bitte notiere Dir Deinen vertraulichen Sicherheitscode. Alternativ kannst Du auch ein Bildschirmfoto machen. Bitte beachte, dass Dir der Code NICHT per E-Mail geschickt wird und er von uns auch NICHT wiederhergestellt werden kann.<br/><br/><b>Du benötigst den Code, wenn Du Dich auf einem anderen Endgerät (Tablet, Smartphone, Laptop etc.) einloggen und Deinen gebuchten Termin einsehen oder ändern willst.</b>
                    </Trans>
                </p>
            )}
            <div
                className={
                    'kip-secrets-box' + (embedded ? ' kip-is-embedded' : '')
                }
            >
                {
                    <F>
                        <div className="kip-uid">
                            {!hideNotice && (
                                <span>
                                    <Trans id="store-secrets.secret">
                                        Dein Sicherheitscode - Bitte notieren!
                                    </Trans>
                                </span>
                            )}
                            <code>{fragments}</code>
                        </div>
                    </F>
                }
            </div>
            {!embedded && (
                <div className="kip-secrets-links">
                    <A
                        className="bulma-button bulma-is-small"
                        onClick={showBookmarkModal}
                    >
                        <Trans id="store-secrets.bookmark">
                            Als Lesezeichen speichern
                        </Trans>
                    </A>
                </div>
            )}
        </F>
    );
};

const StoreLocal = ({ data }) => {
    const blob = new Blob([b642buf(data)], {
        type: 'application/octet-stream',
    });
    const date = new Date().toLocaleDateString();
    return (
        <F>
            <p className="kip-secrets-notice">
                <Trans id="store-secrets.local.text">store-secrects.local.text MISSING</Trans>
            </p>
            <a
                className="bulma-button"
                download={`geheime-daten.kiebitz`}
                href={URL.createObjectURL(blob)}
            >
                <Trans id="store-secrets.download">Datei speichern</Trans>
            </a>
        </F>
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
            <F>
                <CardContent className="kip-secrets">{content}</CardContent>
                <CardFooter>
                    <Button type="success" href={`/user/appointments`}>
                        <Trans id="wizard.leave">Zu den verfügbaren Terminen</Trans>
                    </Button>
                </CardFooter>
            </F>
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
        <Trans id={`store-secrets.${tab}.title`} />
    </Switch>
*/
