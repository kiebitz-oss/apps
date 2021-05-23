// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';

import { keyPairs, validKeyPairs, providerData } from './actions';
import {
    withSettings,
    withActions,
    Tabs,
    Tab,
    T,
    A,
    Message,
} from 'components';
import t from './translations.yml';

const Dashboard = withActions(
    withSettings(
        ({
            route: {
                handler: {
                    props: { tab },
                },
            },
            settings,
            providerData,
            providerDataAction,
            keyPairs,
            keyPairsAction,
            validKeyPairs,
            validKeyPairsAction,
        }) => {
            const [data, setData] = useState(false);
            const [key, setKey] = useState(false);
            const [validKey, setValidKey] = useState(false);

            useEffect(() => {
                if (!data) {
                    setData(true);
                    providerDataAction();
                }
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

            switch (tab) {
                case 'settings':
                    content = <Settings />;
            }

            let invalidKeyMessage;

            if (validKeyPairs !== undefined && validKeyPairs.valid === false) {
                invalidKeyMessage = (
                    <Message type="danger">
                        <T t={t} k="invalid-key" />
                    </Message>
                );
            }

            return (
                <F>
                    <Tabs>
                        <Tab
                            active={tab === 'appointments'}
                            href="/provider/appointments"
                        >
                            <T t={t} k="appointments.title" />
                        </Tab>
                        <Tab
                            active={tab === 'settings'}
                            href="/provider/settings"
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
    [keyPairs, validKeyPairs, providerData]
);

export default Dashboard;
