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
import { Trans, defineMessage } from '@lingui/macro';
import './providers.scss';

const providersMessages = {
    'verified': defineMessage({ id: 'providers.verified', message: 'Bestätigt' }),
    'pending': defineMessage({ id: 'providers.pending', message: 'Unbestätigt' }),
    'reconfirm': defineMessage({ id: 'providers.reconfirm', message: 'Alle neu bestätigen' }),
};

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
                                title={<Trans id="providers.reconfirm">Alle neu bestätigen</Trans>}
                                save={<Trans id="providers.reconfirm">Alle neu bestätigen</Trans>}
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
                                        <Trans
                                            id="providers.reconfirmProgressText"
                                            values={{
                                                i: reconfirmProviders.i,
                                                n: reconfirmProviders.n
                                            }}
                                        >Bestätige Anbieter {i} von {n}...</Trans>
                                    )) || (
                                        <Trans id="providers.reconfirmText">
                                            Wollen Sie alle bestätigten Anbieter neu bestätigen?
                                        </Trans>
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
                                    title={<Trans id="providers.edit">Anbieter bearbeiten</Trans>}
                                    save={<Trans id="providers.confirm">Anbieter freischalten</Trans>}
                                    onSave={doConfirmProvider}
                                    saveType="success"
                                    onClose={closeModal}
                                    onCancel={closeModal}
                                >
                                    <div className="kip-provider-data">
                                        <Trans id="providers.confirmText">Wollen Sie den Anbieter wirklich freischalten?</Trans>
                                        <table className="bulma-table bulma-is-fullwidth bulma-is-striped">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <Trans id="provider-data.field">Feld</Trans>
                                                    </th>
                                                    <th>
                                                        <Trans id="provider-data.value">Wert</Trans>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <Trans id="provider-data.name">Name</Trans>
                                                    </td>
                                                    <td>
                                                        {provider.data.name}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans id="provider-data.street">Straße</Trans>
                                                    </td>
                                                    <td>
                                                        {provider.data.street}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans id="provider-data.city">Stadt</Trans>
                                                    </td>
                                                    <td>
                                                        {provider.data.city}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans id="provider-data.zipCode">Postleitzahl</Trans>
                                                    </td>
                                                    <td>
                                                        {provider.data.zipCode}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans id="provider-data.email">E-Mail</Trans>
                                                    </td>
                                                    <td>
                                                        {provider.data.email}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans id="provider-data.phone">Telefonnummer</Trans>
                                                    </td>
                                                    <td>
                                                        {provider.data.phone}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans id="provider-data.description">Beschreibung</Trans>
                                                    </td>
                                                    <td>
                                                        {
                                                            provider.data
                                                                .description
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
                                            <Trans id={providersMessages[view]} />
                                        </F>
                                    }
                                >
                                    <DropdownMenuItem
                                        icon="check-circle"
                                        onClick={() => setView('verified')}
                                    >
                                        <Trans id="providers.verified">Bestätigt</Trans>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        icon="exclamation-circle"
                                        onClick={() => setView('pending')}
                                    >
                                        <Trans id="providers.pending">Unbestätigt</Trans>
                                    </DropdownMenuItem>
                                </DropdownMenu>
                                <A href="/mediator/providers/reconfirm">
                                    <Trans id="providers.reconfirm">Alle neu bestätigen</Trans>
                                </A>
                                <List>
                                    <ListHeader>
                                        <ListColumn size="md">
                                            <Trans id="providers.name">Name</Trans>
                                        </ListColumn>
                                        <ListColumn size="md">
                                            <Trans id="providers.address">Adresse</Trans>
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
