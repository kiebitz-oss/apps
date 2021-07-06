// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { markAsLoading } from 'helpers/actions';

// make sure the signing and encryption key pairs exist
export async function getStats(state, keyStore, settings, params) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);

    try {
        const stats = await backend.appointments.getStats(params);
        return {
            status: 'loaded',
            data: stats,
        };
    } catch (e) {
        console.err(e);
        return {
            status: 'failed',
            error: e,
        };
    }
}

getStats.actionName = 'getStats';
