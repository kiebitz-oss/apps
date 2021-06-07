// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, Fragment as F } from 'react';
import { b642buf, buf2b64, buf2hex, hex2buf } from 'helpers/conversion';
import Form from 'helpers/form';
import { providers, keyPairs, confirmProvider } from '../actions';
import {
    withActions,
    withRouter,
    withTimer,
    Message,
    Modal,
    WithLoader,
    List,
    Icon,
    ListHeader,
    ListItem,
    ListColumn,
    DropdownMenu,
    DropdownMenuItem,
    T,
} from 'components';
import t from './translations.yml';
import './providers.scss';

const Providers = withTimer(
    withRouter(
        withActions(
            ({
                router,
                action,
                id,
                timer,
                confirmProvider,
                confirmProviderAction,
                keyPairs,
                keyPairsAction,
                providers,
                providersAction,
            }) => {
                const [lastRun, setLastRun] = useState(-1);

                const getData = t => {
                    setLastRun(t);
                    keyPairsAction().then(keyPairs =>
                        providersAction(keyPairs.data)
                    );
                };

                useEffect(() => {
                    if (lastRun !== timer) getData(timer);
                });

                const render = () => {
                    const showProvider = i => {
                        const id = buf2hex(b642buf(i));
                        router.navigateToUrl(`/mediator/providers/show/${id}`);
                    };

                    let modal;

                    const closeModal = () =>
                        router.navigateToUrl('/mediator/providers');

                    if (action === 'show' && id !== undefined) {
                        const base64Id = buf2b64(hex2buf(id));
                        const provider = providers.data.find(
                            provider => provider.id === base64Id
                        );

                        const doConfirmProvider = () => {
                            confirmProviderAction(provider, keyPairs.data).then(
                                () => {
                                    getData();
                                    router.navigateToUrl('/mediator/providers');
                                }
                            );
                        };

                        if (provider !== undefined)
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
                                                            k="provider-data.zipCode"
                                                        />
                                                    </td>
                                                    <td>
                                                        {provider.data.zipCode}
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

                    console.log(providers.data)

                    const providerItems = providers.data.sort((a,b) => a > b).map(provider => (
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
                        <div className="kip-providers">
                            {modal}
                            <DropdownMenu
                                title={
                                    <F>
                                        <Icon icon="check-circle" /> Bestätigt
                                    </F>
                                }
                            >
                                <DropdownMenuItem
                                    icon="check-circle"
                                    onClick={() => console.log('foo')}
                                >
                                    Bestätigt
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    icon="exclamation-circle"
                                    onClick={() => console.log('foo')}
                                >
                                    Unbestätigt
                                </DropdownMenuItem>
                            </DropdownMenu>
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
                        </div>
                    );
                };
                return (
                    <WithLoader
                        resources={[providers, keyPairs]}
                        renderLoaded={render}
                    />
                );
            },
            [providers, keyPairs, confirmProvider]
        )
    ),
    10000
);

export default Providers;
