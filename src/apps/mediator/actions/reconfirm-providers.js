// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign, ecdhDecrypt, ephemeralECDHEncrypt } from 'helpers/crypto';
import { confirmSingleProvider } from './confirm-provider';

export async function reconfirmProviders(
    state,
    keyStore,
    settings,
    providers,
    keyPairs
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('reconfirmProviders');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        keyStore.set({ status: 'inProgress', i: 0, n: providers.length });

        let i = 0;
        for (const providerData of providers) {
            i++;
            try {
                await confirmSingleProvider(providerData, keyPairs, backend);
            } catch (e) {
                console.error(e);
            } finally {
                keyStore.set({
                    status: 'inProgress',
                    i: i,
                    n: providers.length,
                });
            }
        }
        return {
            status: 'succeeded',
        };
    } finally {
        backend.local.unlock('reconfirmProviders');
    }
}

reconfirmProviders.init = () => ({ status: 'initialized' });

reconfirmProviders.actionName = 'reconfirmProviders';
