// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, Fragment as F } from 'react';
import { b642buf, buf2b64, buf2hex, hex2buf } from 'helpers/conversion';
import Form from 'helpers/form';
import {
    reconfirmProviders,
    pendingProviders,
    verifiedProviders,
    keyPairs,
    confirmProvider,
} from '../actions';
import {
    withActions,
    withRouter,
    withTimer,
    Message,
    Modal,
    CardContent,
    WithLoader,
    A,
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

const sortProviderByDate = (a, b) => {
    return new Date(b.entry.timestamp) - new Date(a.entry.timestamp);
};

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
                reconfirmProviders,
                reconfirmProvidersAction,
                keyPairs,
                pendingProviders,
                pendingProvidersAction,
                verifiedProviders,
                verifiedProvidersAction,
            }) => {
                const [lastRun, setLastRun] = useState(-1);
                const [view, setView] = useState('pending');

                const getData = t => {
                    if (keyPairs !== undefined && keyPairs.data !== undefined) {
                        setLastRun(t);
                        pendingProvidersAction(keyPairs.data).then(pd =>
                            verifiedProvidersAction(keyPairs.data).then(vp => {
                                // do something
                            })
                        );
                    }
                };

                useEffect(() => {
                    if (lastRun !== timer) getData(timer);
                });

                const providers =
                    view === 'pending' ? pendingProviders : verifiedProviders;

                const render = () => {
                    const showProvider = i => {
                        const id = buf2hex(b642buf(i));
                        router.navigateToUrl(`/mediator/providers/show/${id}`);
                    };

                    let modal;

                    const closeModal = () =>
                        router.navigateToUrl('/mediator/providers');

                    const closeReconfirmModal = () => {
                        if (reconfirmProviders.status === 'inProgress') return;
                        router.navigateToUrl('/mediator/providers');
                    };

                    const doReconfirmProviders = () => {
                        reconfirmProvidersAction(
                            verifiedProviders.data,
                            keyPairs.data
                        );
                    };

                    if (action === 'reconfirm')
                        modal = (
                            <Modal
                                title={<T t={t} k="providers.reconfirm" />}
                                save={<T t={t} k="providers.reconfirm" />}
                                onSave={doReconfirmProviders}
                                saveType="success"
                                disabled={
                                    reconfirmProviders.status === 'inProgress'
                                }
                                onClose={closeModal}
                                onCancel={closeModal}
                            >
                                <div className="kip-provider-data">
                                    {(reconfirmProviders.status ===
                                        'inProgress' && (
                                        <T
                                            t={t}
                                            k="providers.reconfirmProgressText"
                                            i={reconfirmProviders.i}
                                            n={reconfirmProviders.n}
                                        />
                                    )) || (
                                        <T t={t} k="providers.reconfirmText" />
                                    )}
                                </div>
                            </Modal>
                        );

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
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.description"
                                                        />
                                                    </td>
                                                    <td>
                                                        {
                                                            provider.data
                                                                .description
                                                        }
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <T
                                                            t={t}
                                                            k="provider-data.queues"
                                                        />
                                                    </td>
                                                    <td>
                                                        {
                                                            provider.data.queues
                                                                .length
                                                        }
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Modal>
                            );
                    }

                    const providerItems = providers.data
                        .sort(sortProviderByDate)
                        .map(provider => (
                            <ListItem
                                onClick={() => showProvider(provider.id)}
                                key={provider.id}
                                isCard
                            >
                                <ListColumn size="md">
                                    {provider.data.name}
                                </ListColumn>
                                <ListColumn size="md">
                                    {provider.data.street} ·{' '}
                                    {provider.data.city}
                                </ListColumn>
                            </ListItem>
                        ));

                    return (
                        <CardContent>
                            <div className="kip-providers">
                                {modal}
                                <DropdownMenu
                                    title={
                                        <F>
                                            <Icon icon="check-circle" />
                                            <T t={t} k={`providers.${view}`} />
                                        </F>
                                    }
                                >
                                    <DropdownMenuItem
                                        icon="check-circle"
                                        onClick={() => setView('verified')}
                                    >
                                        <T t={t} k="providers.verified" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        icon="exclamation-circle"
                                        onClick={() => setView('pending')}
                                    >
                                        <T t={t} k="providers.pending" />
                                    </DropdownMenuItem>
                                </DropdownMenu>
                                <A href="/mediator/providers/reconfirm">
                                    <T t={t} k="providers.reconfirm" />
                                </A>
                                <List>
                                    <ListHeader>
                                        <ListColumn size="md">
                                            <T t={t} k="providers.name" />
                                        </ListColumn>
                                        <ListColumn size="md">
                                            <T t={t} k="providers.address" />
                                        </ListColumn>
                                    </ListHeader>
                                    {providerItems}
                                </List>
                            </div>
                        </CardContent>
                    );
                };
                return (
                    <WithLoader
                        resources={[
                            pendingProviders,
                            verifiedProviders,
                            keyPairs,
                        ]}
                        renderLoaded={render}
                    />
                );
            },
            [
                pendingProviders,
                reconfirmProviders,
                verifiedProviders,
                keyPairs,
                confirmProvider,
            ]
        )
    ),
    10000
);

export default Providers;
