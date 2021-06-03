// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { markAsLoading } from 'helpers/actions';

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let tv = 0;
// to do: add keyPair to queue request (as the request needs to be signed)
export async function queues(state, keyStore, settings, zipCode, radius, to) {
    const q = async () => {
        const backend = settings.get('backend');
        if (!markAsLoading(state, keyStore)) return; // we're already loading queues
        try {
            const queues = await backend.appointments.getQueues({
                zipCode,
                radius,
            });
            return { status: 'loaded', data: queues };
        } catch (e) {
            return { status: 'failed', error: e };
        }
    };
    if (to !== undefined) {
        const ti = tv++;
        await timeout(to);
        if (tv - 1 > ti) return;
        return await q();
    } else {
        return await q();
    }
}

queues.reset = () => ({ status: 'initialized' });

queues.actionName = 'queues';
