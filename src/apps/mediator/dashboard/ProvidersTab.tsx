// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { withActions, WithLoader } from 'components';
import { BoxContent, DropdownMenu, DropdownMenuItem, Link } from 'ui';
import { Trans, defineMessage, t } from '@lingui/macro';
import { useParams } from 'react-router';
import { useEffectOnce, useInterval } from 'react-use';
import { b642buf, buf2b64, buf2hex, hex2buf } from 'helpers/conversion';
import {
    reconfirmProviders,
    pendingProviders,
    verifiedProviders,
    keyPairs,
    confirmProvider,
} from 'apps/mediator/actions';
import { ConfirmProviderModal } from './ConfirmProviderModal';
import { ReconfirmProvidersModal } from './ReconfirmProvidersModal';

const providersMessages = {
    verified: defineMessage({ id: 'providers.verified', message: 'Bestätigt' }),
    pending: defineMessage({ id: 'providers.pending', message: 'Unbestätigt' }),
    reconfirm: defineMessage({
        id: 'providers.reconfirm',
        message: 'Alle neu bestätigen',
    }),
};

const sortProviderByDate = (a: any, b: any) => {
    return new Date(b.entry.timestamp) - new Date(a.entry.timestamp);
};

const ProvidersTabBase: React.FC<any> = ({
    keyPairs,
    pendingProviders,
    pendingProvidersAction,
    verifiedProviders,
    verifiedProvidersAction,
}) => {
    const [view, setView] = useState('pending');
    const { action, secondaryAction } = useParams();

    const getData = () => {
        if (keyPairs?.data !== undefined) {
            pendingProvidersAction(keyPairs.data).then((pd: any) =>
                verifiedProvidersAction(keyPairs.data).then((vp: any) => {
                    // do something
                })
            );
        }
    };

    useEffectOnce(() => {
        getData();
    });

    useInterval(() => {
        getData();
    }, 10000);

    const providers = view === 'pending' ? pendingProviders : verifiedProviders;

    const render = () => {
        let modal;

        if (action === 'reconfirm') {
            modal = <ReconfirmProvidersModal />;
        }

        if (action === 'show' && secondaryAction !== undefined) {
            const base64Id = buf2b64(hex2buf(secondaryAction));

            const provider = providers.data.find(
                (provider) => provider.publicKeys.signing === base64Id
            );

            if (provider !== undefined) {
                modal = <ConfirmProviderModal provider={provider} />;
            }
        }

        return (
            <>
                <BoxContent>
                    <DropdownMenu
                        label={t({
                            id: providersMessages[view].id,
                            message: providersMessages[view].message,
                        })}
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

                    <Link
                        href="/mediator/providers/reconfirm"
                        type="button"
                        variant="primary"
                        size="sm"
                    >
                        <Trans id="providers.reconfirm">
                            Alle neu bestätigen
                        </Trans>
                    </Link>

                    <table className="table striped">
                        <thead>
                            <tr>
                                <th scope="col">
                                    <Trans id="providers.name">Name</Trans>
                                </th>
                                <th scope="col">
                                    <Trans id="providers.address">
                                        Adresse
                                    </Trans>
                                </th>
                                <th scope="col">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {providers.data
                                .sort(sortProviderByDate)
                                .map((provider: any) => {
                                    const id = buf2hex(
                                        b642buf(provider.publicKeys.signing)
                                    );
                                    const providerLink = `/mediator/providers/show/${id}`;

                                    return (
                                        <tr key={provider.publicKeys.signing}>
                                            <td>
                                                <Link href={providerLink}>
                                                    {provider.data.name ||
                                                        'Name missing'}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                                                {provider.data.street} ·{' '}
                                                {provider.data.zip} ·{' '}
                                                {provider.data.city}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                                                <a
                                                    href="#"
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </BoxContent>

                {modal}
            </>
        );
    };

    return (
        <WithLoader
            resources={[pendingProviders, verifiedProviders, keyPairs]}
            renderLoaded={render}
        />
    );
};

export const ProvidersTab = withActions(ProvidersTabBase, [
    pendingProviders,
    reconfirmProviders,
    verifiedProviders,
    keyPairs,
    confirmProvider,
]);
