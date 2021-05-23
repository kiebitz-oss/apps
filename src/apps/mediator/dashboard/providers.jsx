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
    providerDataKeyPair,
    confirmProvider,
} from './actions';
import {
    withActions,
    withRouter,
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

const Providers = withRouter(
    withActions(
        ({
            router,
            providerDataKeyPair,
            providerDataKeyPairAction,
            action,
            id,
            confirmProvider,
            confirmProviderAction,
            keyPairs,
            keyPairsAction,
            providers,
            providersAction,
        }) => {
            const [initialized, setInitialized] = useState();

            useEffect(() => {
                if (!initialized) {
                    setInitialized(true);
                    providerDataKeyPairAction().then(kp =>
                        keyPairsAction().then(keyPairs =>
                            providersAction(keyPairs.data, kp.data)
                        )
                    );
                }
            });

            const render = () => {
                const showProvider = i =>
                    router.navigateToUrl(`/mediator/providers/show/${i}`);

                let modal;

                const closeModal = () =>
                    router.navigateToUrl('/mediator/providers');

                const doConfirmProvider = () => {
                    const provider = providers.data[id];
                    confirmProviderAction(provider, keyPairs.data).then(() => {
                        // we reload the providersAction
                        setInitialized(false);
                        router.navigateToUrl('/mediator/providers');
                    });
                };

                if (action === 'show' && id !== undefined) {
                    const provider = providers.data[id];
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
                                            <td>{provider.data.name}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <T
                                                    t={t}
                                                    k="provider-data.street"
                                                />
                                            </td>
                                            <td>{provider.data.street}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <T
                                                    t={t}
                                                    k="provider-data.city"
                                                />
                                            </td>
                                            <td>{provider.data.city}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <T
                                                    t={t}
                                                    k="provider-data.zip_code"
                                                />
                                            </td>
                                            <td>{provider.data.zip_code}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <T
                                                    t={t}
                                                    k="provider-data.email"
                                                />
                                            </td>
                                            <td>{provider.data.email}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <T
                                                    t={t}
                                                    k="provider-data.phone"
                                                />
                                            </td>
                                            <td>{provider.data.phone}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Modal>
                    );
                }

                const providerItems = providers.data.map((provider, i) => (
                    <ListItem onClick={() => showProvider(i)} key={i} isCard>
                        <ListColumn size="md">{provider.data.name}</ListColumn>
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
                    resources={[providers, keyPairs, providerDataKeyPair]}
                    renderLoaded={render}
                />
            );
        },
        [providers, keyPairs, providerDataKeyPair, confirmProvider]
    )
);

export default Providers;
