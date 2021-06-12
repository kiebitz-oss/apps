// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserTemporaryQueueData, setUserTemporaryQueueData } from '../../../../kiebitz/user/queue';

export async function queueData(state, keyStore, settings, data) {
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
        data,
    };
}

queueData.actionName = 'queueData';
