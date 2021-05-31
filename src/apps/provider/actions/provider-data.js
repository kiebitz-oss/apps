// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from 'helpers/crypto';

// generate and return the (local) provider data
export async function providerData(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
        let providerData = backend.local.get('provider::data');
        if (providerData === null) {
            providerData = {
                id: randomBytes(32),
                verifiedID: randomBytes(32),
                data: {},
            };
        }
        if (data !== undefined) {
            providerData.data = data;
            const queues = await backend.appointments.getQueues({
                zipCode: providerData.data.zip_code,
                radius: 50,
            });
            providerData.data.queues = queues.map(q => q.id);
        }
        backend.local.set('provider::data', providerData);
        return {
            status: 'loaded',
            data: providerData,
        };
    } finally {
        backend.local.unlock();
    }
}
