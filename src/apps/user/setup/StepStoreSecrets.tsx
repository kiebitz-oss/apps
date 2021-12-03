// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { b642buf } from 'helpers/conversion';
import { withActions, CardContent, CardFooter, A, Button } from 'components';
import { userSecret } from 'apps/user/actions';
import { t, Trans } from '@lingui/macro';
// import './store-secrets.scss';

interface StoreOnlineProps {
    secret: string;
    embedded?: boolean;
    hideNotice?: boolean;
}

export const StoreOnline: React.FC<StoreOnlineProps> = ({
    secret,
    embedded,
    hideNotice,
}) => {
    const [bookmarkModal, setBookmarkModal] = useState(false);

    let modal;

    const showBookmarkModal = () => {
        history.pushState(
            {},
            t({
                id: 'store-secrets.restore.title',
                message: 'store-secrets.restore.title MISSING',
            }),
            `/user/restore#${secret},v0.1`
        );
        setBookmarkModal(true);
    };

    const hideBookmarkModal = () => {
        history.back();
        setBookmarkModal(false);
    };

    const chunks = secret?.match(/.{1,4}/g) || [];

    const fragments: React.ReactNode[] = [];

    for (let i = 0; i < chunks.length; i++) {
        fragments.push(
            <React.Fragment key={`${i}-main`}>{chunks[i]}</React.Fragment>
        );

        if (i < chunks.length - 1)
            fragments.push(
                <strong key={`${i}-dot`} style={{ userSelect: 'none' }}>
                    ·
                </strong>
            );
    }

    return (
        <>
            {modal}
            {!embedded && (
                <p className="kip-secrets-notice">
                    <Trans id="store-secrets.online.text">
                        Bitte notiere Dir Deinen vertraulichen Sicherheitscode.
                        Alternativ kannst Du auch ein Bildschirmfoto machen.
                        Bitte beachte, dass Dir der Code NICHT per E-Mail
                        geschickt wird und er von uns auch NICHT
                        wiederhergestellt werden kann.
                        <br />
                        <br />
                        <b>
                            Du benötigst den Code, wenn Du Dich auf einem
                            anderen Endgerät (Tablet, Smartphone, Laptop etc.)
                            einloggen und Deinen gebuchten Termin einsehen oder
                            ändern willst.
                        </b>
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
                                        Dein Sicherheitscode - Bitte notieren!
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
                        className="bulma-button bulma-is-small"
                        onClick={showBookmarkModal}
                    >
                        <Trans id="store-secrets.bookmark">
                            Als Lesezeichen speichern
                        </Trans>
                    </Button>
                </div>
            )}
        </>
    );
};

const StoreLocal: React.FC<{ data: any }> = ({ data }) => {
    const blob = new Blob([b642buf(data)], {
        type: 'application/octet-stream',
    });

    return (
        <>
            <p className="kip-secrets-notice">
                <Trans id="store-secrets.local.text">
                    store-secrects.local.text MISSING
                </Trans>
            </p>
            <a
                className="bulma-button"
                download={`geheime-daten.kiebitz`}
                href={URL.createObjectURL(blob)}
            >
                <Trans id="store-secrets.download">Datei speichern</Trans>
            </a>
        </>
    );
};

const StoreSecretPage: React.FC<any> = ({ userSecret }) => {
    const [tab, _] = useState('online');

    let content;

    switch (tab) {
        case 'online':
            content = <StoreOnline secret={userSecret?.data} />;
            break;
        case 'local':
            content = <StoreLocal data={'data'} />;
            break;
    }

    return (
        <>
            <CardContent className="kip-secrets">{content}</CardContent>

            <CardFooter>
                <A type="button" variant="success" href={`/user/appointments`}>
                    <Trans id="wizard.leave">Zu den verfügbaren Terminen</Trans>
                </A>
            </CardFooter>
        </>
    );
};

export default withActions(StoreSecretPage, [userSecret]);