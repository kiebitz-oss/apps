// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { markAsLoading } from 'helpers/actions';

export async function keys(state, keyStore, settings) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);
    try {
        const keys = await backend.appointments.getKeys();
        return {
            status: 'loaded',
            data: keys,
        };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}
