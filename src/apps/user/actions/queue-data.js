// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserTemporaryQueueData, setUserTemporaryQueueData } from '../../../../kiebitz/user/queue';

export async function queueData(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('queueData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }
    
    try {

        if (data !== undefined) {
            await setUserTemporaryQueueData(data);
        }
    
        data = await getUserTemporaryQueueData();

        if (data === null) {
            return {
                status: 'failed',
            };
        }

        return {
            status: 'loaded',
            data: data,
        };
    }  finally {
        backend.local.unlock('queueData');
    }
}

queueData.actionName = 'queueData';
