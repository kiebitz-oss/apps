// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, Fragment as F } from 'react';
import { StoreOnline } from 'apps/user/setup/store-secrets';
import { userSecret, backupData } from 'apps/user/actions';
import './settings.scss';
import { Trans } from '@lingui/macro';

import {
    withSettings,
    withActions,
    Modal,
    CardContent,
    CardFooter,
    Button,
} from 'components';
import { useNavigate } from 'react-router-dom';

const Settings = withActions(
        withSettings(({ settings, action, userSecret, backupDataAction }) => {
            const [loggingOut, setLoggingOut] = useState(false);
            const navigate = useNavigate();

            let logOutModal;

            const cancel = () => {
                navigate('/user/settings');
            };

            const logOut = () => {
                setLoggingOut(true);
                const backend = settings.get('backend');
                // we perform a backup before logging the user out...
                backupDataAction(userSecret.data, 'logout').then(() => {
                    backend.local.deleteAll('user::');
                    setLoggingOut(false);
                    navigate('/user/logged-out');
                });
            };

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
                            <Trans id={
                                loggingOut
                                    ? 'log-out-modal.logging-out'
                                    : 'log-out-modal.text'
                            }
                            >{
                                loggingOut
                                    ? "Bitte warten, Sie werden abgemeldet..."
                                    : "Möchtest Du Dich wirklich abmelden? Bitte stelle vorher sicher, dass Du Deinen Sicherheitscode notiert hast. Nur mit diesem Code kannst Du Dich später wieder anmelden."
                            }</Trans>
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
                <F>
                    <CardContent>
                        <div className="kip-user-settings">
                            {logOutModal}
                            <h2>
                                <Trans id="user-data.title">Deine Daten</Trans>
                            </h2>
                            <p>
                                <Trans id="user-data.notice">Du kannst Dich hier abmelden oder Deine Daten endgültig löschen</Trans>
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="kip-buttons">
                            <Button
                                type="warning"
                                href="/user/settings/logout"
                            >
                                <Trans id="log-out">Abmelden</Trans>
                            </Button>
                        </div>
                    </CardFooter>
                </F>
            );
        }
    ),
    [userSecret, backupData]
);

export default Settings;
