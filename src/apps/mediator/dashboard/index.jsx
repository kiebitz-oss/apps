// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Providers from './providers';

import {
    withSettings,
    withActions,
    Tabs,
    Tab,
    T,
    A,
    Message,
} from 'components';
import { keyPairs, validKeyPairs } from './actions';
import t from './translations.yml';

const Dashboard = withActions(
    withSettings(
        ({
            route: {
                handler: {
                    props: { tab, action, id },
                },
            },
            settings,
            keyPairs,
            keyPairsAction,
            validKeyPairs,
            validKeyPairsAction,
        }) => {
            const [key, setKey] = useState(false);
            const [validKey, setValidKey] = useState(false);

            useEffect(() => {
                if (!key) {
                    setKey(true);
                    keyPairsAction();
                }
                if (!validKey && keyPairs !== undefined) {
                    setValidKey(true);
                    validKeyPairsAction(keyPairs);
                }
            });

            let content;

            if (keyPairs !== undefined) {
                switch (tab) {
                    case 'settings':
                        content = <Settings />;
                        break;
                    case 'providers':
                        content = <Providers action={action} id={id} />;
                        break;
                }
            }

            let invalidKeyMessage;

            if (validKeyPairs !== undefined && validKeyPairs.valid === false) {
                invalidKeyMessage = (
                    <Message type="danger">
                        <T t={t} k="invalidKey" />
                    </Message>
                );
            }

            return (
                <F>
                    <Tabs>
                        <Tab
                            active={tab === 'providers'}
                            href="/mediator/providers"
                        >
                            <T t={t} k="providers.title" />
                        </Tab>
                        <Tab active={tab === 'queues'} href="/mediator/queues">
                            <T t={t} k="queues.title" />
                        </Tab>
                        <Tab
                            active={tab === 'settings'}
                            href="/mediator/settings"
                        >
                            <T t={t} k="settings.title" />
                        </Tab>
                    </Tabs>
                    {invalidKeyMessage}
                    {content}
                </F>
            );
        }
    ),
    [keyPairs, validKeyPairs]
);

export default Dashboard;
