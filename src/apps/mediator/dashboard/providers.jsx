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

import React, { useState, useEffect, Fragment as F } from 'react';
import Form from 'helpers/form';
import {
    providers,
    keyPairs,
    queueKeyPair,
    providerDataKeyPair,
    confirmProvider,
} from './actions';
import {
    withActions,
    withRouter,
    withTimer,
    Message,
    Modal,
    WithLoader,
    List,
    ListHeader,
    ListItem,
    ListColumn,
    T,
} from 'components';
import t from './translations.yml';
import './settings.scss';

const Providers = withTimer(
    withRouter(
        withActions(
            ({
                router,
                providerDataKeyPair,
                providerDataKeyPairAction,
                action,
                id,
                timer,
                confirmProvider,
                confirmProviderAction,
                queueKeyPair,
                queueKeyPairAction,
                keyPairs,
                keyPairsAction,
                providers,
                providersAction,
            }) => {
                const [lastRun, setLastRun] = useState(-1);

                const getData = t => {
                    setLastRun(t);
                    providerDataKeyPairAction().then(kp =>
                        queueKeyPairAction().then(qk =>
                            keyPairsAction().then(keyPairs =>
                                providersAction(keyPairs.data, kp.data)
                            )
                        )
                    );
                };

                useEffect(() => {
                    if (lastRun !== timer) getData(timer);
                });

                const render = () => {
                    const showProvider = i =>
                        router.navigateToUrl(`/mediator/providers/show/${i}`);

                    let modal;

                    const closeModal = () =>
                        router.navigateToUrl('/mediator/providers');

                    const doConfirmProvider = () => {
                        const provider = providers.data.find(
                            provider => provider.id === id
                        );
                        if (provider === null) return;
                        confirmProviderAction(
                            provider,
                            keyPairs.data,
                            queueKeyPair.data
                        ).then(() => {
                            getData();
                            router.navigateToUrl('/mediator/providers');
                        });
                    };

                    if (action === 'show' && id !== undefined) {
                        const provider = providers.data.find(
                            provider => provider.id === id
                        );
                        if (provider !== null)
                            modal = (
                                <Modal
                                    title={<T t={t} k="providers.edit" />}
                                    save={<T t={t} k="providers.confirm" />}
                                    onSave={doConfirmProvider}
                                    saveType="success"
                                    onClose={closeModal}
                                    onCancel={closeModal}
                                >
                                    <div className="kip-provider-data">
                                        <T t={t} k="providers.confirmText" />
                                        <table className="bulma-table bulma-is-fullwidth bulma-is-striped">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <T
                                                            t={t}
                                                            k="provider-data.field"
                                                        />
                                                    </th>
                                                    <th>
                                                        <T
                                                            t={t}
                                                            k="provider-data.value"
                                                        />
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.name"
                                                        />
                                                    </td>
                                                    <td>
                                                        {provider.data.name}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.street"
                                                        />
                                                    </td>
                                                    <td>
                                                        {provider.data.street}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.city"
                                                        />
                                                    </td>
                                                    <td>
                                                        {provider.data.city}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.zip_code"
                                                        />
                                                    </td>
                                                    <td>
                                                        {provider.data.zip_code}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.email"
                                                        />
                                                    </td>
                                                    <td>
                                                        {provider.data.email}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.phone"
                                                        />
                                                    </td>
                                                    <td>
                                                        {provider.data.phone}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Modal>
                            );
                    }

                    const providerItems = providers.data.map(provider => (
                        <ListItem
                            onClick={() => showProvider(provider.id)}
                            key={provider.id}
                            isCard
                        >
                            <ListColumn size="md">
                                {provider.data.name}
                            </ListColumn>
                            <ListColumn size="md">
                                {provider.data.street} · {provider.data.city}
                            </ListColumn>
                            <ListColumn size="icon"></ListColumn>
                        </ListItem>
                    ));

                    return (
                        <F>
                            {modal}
                            <List>
                                <ListHeader>
                                    <ListColumn size="md">
                                        <T t={t} k="providers.name" />
                                    </ListColumn>
                                    <ListColumn size="md">
                                        <T t={t} k="providers.address" />
                                    </ListColumn>
                                    <ListColumn size="icon">
                                        <T t={t} k="providers.menu" />
                                    </ListColumn>
                                </ListHeader>
                                {providerItems}
                            </List>
                        </F>
                    );
                };
                return (
                    <WithLoader
                        resources={[
                            providers,
                            keyPairs,
                            queueKeyPair,
                            providerDataKeyPair,
                        ]}
                        renderLoaded={render}
                    />
                );
            },
            [
                providers,
                keyPairs,
                providerDataKeyPair,
                queueKeyPair,
                confirmProvider,
            ]
        )
    ),
    10000
);

export default Providers;
