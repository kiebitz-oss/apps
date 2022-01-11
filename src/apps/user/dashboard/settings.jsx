// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, Fragment as F } from 'react';
import { StoreOnline } from 'apps/user/setup/store-secrets';
import './settings.scss';
import t from './translations.yml';

import {
    withRouter,
    withSettings,
    withActions,
    Modal,
    CardContent,
    CardFooter,
    Message,
    T,
    A,
    Button,
} from 'components';

const Settings = withActions(
    withSettings(
        withRouter(
            ({ settings, action, router, userSecret, backupDataAction }) => {
                const [loggingOut, setLoggingOut] = useState(false);

                let logOutModal;

                const cancel = () => {
                    router.navigateToUrl('/user/settings');
                };

                const logOut = () => {
                    setLoggingOut(true);
                    const backend = settings.get('backend');
                    // we perform a backup before logging the user out...
                    backupDataAction(userSecret.data, 'logout').then(() => {
                        backend.local.deleteAll('user::');
                        setLoggingOut(false);
                        router.navigateToUrl('/user/logged-out');
                    });
                };

                if (action === 'logout') {
                    logOutModal = (
                        <Modal
                            onClose={cancel}
                            save={<T t={t} k="log-out" />}
                            disabled={loggingOut}
                            waiting={loggingOut}
                            title={<T t={t} k="log-out-modal.title" />}
                            onCancel={cancel}
                            onSave={logOut}
                            saveType="warning"
                        >
                            <p>
                                <T
                                    t={t}
                                    k={
                                        loggingOut
                                            ? 'log-out-modal.logging-out'
                                            : 'log-out-modal.text'
                                    }
                                />
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
                                    <T t={t} k="user-data.title" />
                                </h2>
                                <p>
                                    <T t={t} k="user-data.notice" />
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="kip-buttons">
                                <Button
                                    type="warning"
                                    href="/user/settings/logout"
                                >
                                    <T t={t} k="log-out" />
                                </Button>
                            </div>
                        </CardFooter>
                    </F>
                );
            }
        )
    ),
    []
);

export default Settings;
