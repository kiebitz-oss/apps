// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, Fragment as F } from 'react';
import { b642buf, buf2b64, buf2hex, hex2buf } from 'helpers/conversion';
import Form from 'helpers/form';
import { useMediator, useInterval, useRouter } from 'hooks';
import {
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
    return new Date(b.timestamp) - new Date(a.timestamp);
};

const Providers = ({ action, id }) => {
    const router = useRouter();
    const mediator = useMediator();
    const [view, setView] = useState('pending');

    useInterval(async () => {
        await mediator.pendingProviders().get();
        await mediator.verifiedProviders().get();
    }, 10000);

    const render = () => {
        const providers =
            view === 'pending'
                ? mediator.pendingProviders().result()
                : mediator.verifiedProviders().result();

        const showProvider = (i) => {
            const id = buf2hex(b642buf(i));
            router.navigateToUrl(`/mediator/providers/show/${id}`);
        };

        let modal;

        const closeModal = () => router.navigateToUrl('/mediator/providers');

        if (action === 'show' && id !== undefined) {
            const base64Id = buf2b64(hex2buf(id));
            const provider = providers.data.find(
                (provider) => provider.data.publicKeys.signing === base64Id
            );

            const doConfirmProvider = async () => {
                const result = await mediator.confirmProvider(provider);
                console.log(result);
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
                                            <T t={t} k="provider-data.field" />
                                        </th>
                                        <th>
                                            <T t={t} k="provider-data.value" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <T t={t} k="provider-data.name" />
                                        </td>
                                        <td>{provider.data.name}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <T t={t} k="provider-data.street" />
                                        </td>
                                        <td>{provider.data.street}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <T t={t} k="provider-data.city" />
                                        </td>
                                        <td>{provider.data.city}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <T
                                                t={t}
                                                k="provider-data.zipCode"
                                            />
                                        </td>
                                        <td>{provider.data.zipCode}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <T t={t} k="provider-data.email" />
                                        </td>
                                        <td>{provider.data.email}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <T t={t} k="provider-data.phone" />
                                        </td>
                                        <td>{provider.data.phone}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <T
                                                t={t}
                                                k="provider-data.description"
                                            />
                                        </td>
                                        <td>{provider.data.description}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Modal>
                );
        }

        console.log(providers);

        const providerItems = providers.data
            .sort(sortProviderByDate)
            .map((provider) => (
                <ListItem
                    onClick={() =>
                        showProvider(provider.data.publicKeys.signing)
                    }
                    key={provider.data.publicKeys.signing}
                    isCard
                >
                    <ListColumn size="md">{provider.data.name}</ListColumn>
                    <ListColumn size="md">
                        {provider.data.street} · {provider.data.city}
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
                mediator.pendingProviders().result(),
                mediator.verifiedProviders().result(),
            ]}
            renderLoaded={render}
        />
    );
};

export default Providers;
