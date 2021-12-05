// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { buf2base32, b642buf } from 'helpers/conversion';
import { randomBytes } from 'helpers/crypto';

export async function providerSecret(
    state,
    keyStore,
    settings,
    data,
    lockName
) {
    const backend = settings.get('backend');

    if (lockName === undefined) lockName = 'providerSecret';

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock(lockName);
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        if (data !== undefined) backend.local.set('provider::secret', data);
        data = backend.local.get('provider::secret');
        if (data === null)
            return {
                status: 'failed',
            };
        return {
            status: 'loaded',
            data: data,
        };
    } finally {
        backend.local.unlock(lockName);
    }
}

providerSecret.init = (keyStore, settings) => {
    const backend = settings.get('backend');
    let data = backend.local.get('provider::secret');
    if (data === null) {
        data = buf2base32(b642buf(randomBytes(15)));
        backend.local.set('provider::secret', data);
    }
    return {
        status: 'loaded',
        data: data,
    };
};

providerSecret.actionName = 'providerSecret';
