// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { markAsLoading } from 'helpers/actions';

// to do: add keyPair to queue request (as the request needs to be signed)
export async function queues(state, keyStore, settings, queueIDs) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);
    try {
        const queues = await backend.appointments.getQueues(queueIDs);
        return { status: 'loaded', data: queues };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}
