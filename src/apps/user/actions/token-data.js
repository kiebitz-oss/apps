// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserTokenData } from '../../../../kiebitz/user/token-data';

export async function tokenData(state, keyStore, settings) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('tokenData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        return {
            status: 'loaded',
            data: await getUserTokenData(),
        };
    } finally {
        backend.local.unlock('tokenData');
    }
}

tokenData.actionName = 'tokenData';
