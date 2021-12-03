// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { StoreOnline } from 'apps/user/setup/StepStoreSecrets';
import { userSecret, backupData } from 'apps/user/actions';
import { Trans } from '@lingui/macro';
import { withActions, Modal, CardContent, CardFooter, A } from 'components';
import { useNavigate } from 'react-router-dom';
import { useBackend } from 'hooks';
import './settings.scss';

const SettingsPage: React.FC<any> = ({
    action,
    userSecret,
    backupDataAction,
}) => {
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const backend = useBackend();

    const cancel = () => {
        navigate('/user/settings');
    };

    const logOut = () => {
        setLoggingOut(true);

        // we perform a backup before logging the user out...
        backupDataAction(userSecret.data, 'logout').then(() => {
            backend.local.deleteAll('user::');
            setLoggingOut(false);
            navigate('/user/logged-out');
        });
    };

    let logOutModal;

    if (action === 'logout') {
        logOutModal = (
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
                            : 'Möchtest Du Dich wirklich abmelden? Bitte stelle vorher sicher, dass Du Deinen Sicherheitscode notiert hast. Nur mit diesem Code kannst Du Dich später wieder anmelden.'}
                    </Trans>
                </p>
                <hr />
                {userSecret !== undefined && (
                    <StoreOnline
                        secret={userSecret.data}
                        embedded={true}
                        hideNotice={true}
                    />
                )}
            </Modal>
        );
    }

    return (
        <>
            {logOutModal}

            <CardContent className="kip-user-settings">
                <h2>
                    <Trans id="user-data.title">Deine Daten</Trans>
                </h2>

                <p>
                    <Trans id="user-data.notice">
                        Du kannst Dich hier abmelden oder Deine Daten endgültig
                        löschen
                    </Trans>
                </p>
            </CardContent>

            <CardFooter className="kip-buttons">
                <A type="button" variant="warning" href="/user/settings/logout">
                    <Trans id="log-out">Abmelden</Trans>
                </A>
            </CardFooter>
        </>
    );
};

export default withActions(SettingsPage, [userSecret, backupData]);
