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
import { e } from 'helpers/async';
import Form from 'helpers/form';
import {
    withActions,
    withRouter,
    Message,
    Modal,
    List,
    ListHeader,
    ListItem,
    ListColumn,
    T,
} from 'components';
import t from './translations.yml';
import './settings.scss';

async function providers(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');
    keyStore.set({ status: 'loading' });
    try {
        const providersList = await e(
            backend.appointments.getPendingProviderData(keyPairs, 10)
        );
        return { list: providersList, status: 'loaded' };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

const Providers = withRouter(
    withActions(
        ({ router, action, id, keyPairs, providers, providersAction }) => {
            const [loaded, setLoaded] = useState();

            useEffect(() => {
                if (!loaded) {
                    setLoaded(true);
                    providersAction(keyPairs);
                }
            });

            if (providers === undefined || providers.status === 'loading')
                return (
                    <F>
                        <Message type="info">
                            <T t={t} k="providers.loading" />
                        </Message>
                    </F>
                );

            if (providers.status === 'failed')
                return (
                    <F>
                        <Message type="danger">
                            <T t={t} k="providers.failed" />
                        </Message>
                    </F>
                );

            const showProvider = i =>
                router.navigateToUrl(`/mediator/providers/show/${i}`);

            let modal;

            const closeModal = () =>
                router.navigateToUrl('/mediator/providers');
            const confirmProvider = () =>
                router.navigateToUrl('/mediator/providers');

            if (action === 'show' && id !== undefined) {
                modal = (
                    <Modal
                        title={<T t={t} k="providers.edit" />}
                        save={<T t={t} k="providers.confirm" />}
                        onSave={confirmProvider}
                        onClose={closeModal}
                        onCancel={closeModal}
                    >
                        <T t={t} k="providers.confirmText" />
                    </Modal>
                );
            }

            const providerItems = providers.list.map((provider, i) => (
                <ListItem onClick={() => showProvider(i)} key={i} isCard>
                    <ListColumn>{provider.data.info.name}</ListColumn>
                </ListItem>
            ));

            return (
                <F>
                    {modal}
                    <List>
                        <ListHeader>
                            <ListColumn>
                                <T t={t} k="providers.name" />
                            </ListColumn>
                            <ListColumn>
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
        },
        [providers]
    )
);

export default Providers;
