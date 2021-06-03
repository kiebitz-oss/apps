// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { markAsLoading } from 'helpers/actions';

export async function keys(state, keyStore, settings) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);
    try {
        const keys = await backend.appointments.getKeys();

        for (const providerKeys of keys.lists.providers) {
            providerKeys.json = JSON.parse(providerKeys.data);
        }
        for (const mediatorKeys of keys.lists.mediators) {
            mediatorKeys.json = JSON.parse(mediatorKeys.data);
        }

        return {
            status: 'loaded',
            data: keys,
        };
    } catch (e) {
        return { status: 'failed', error: e };
    }
}

keys.actionName = 'keys';
