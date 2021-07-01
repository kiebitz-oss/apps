// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function queueData(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('queueData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        // we just store the data...
        if (data !== undefined) backend.temporary.set('user::queueData', data);
        data = backend.temporary.get('user::queueData');
        if (data === null)
            return {
                status: 'failed',
            };
        return {
            status: 'loaded',
            data: data,
        };
    } finally {
        backend.local.unlock('queueData');
    }
}

queueData.actionName = 'queueData';
