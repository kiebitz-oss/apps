// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from 'helpers/crypto';
import { buf2base32, b642buf } from 'helpers/conversion';

export async function userSecret(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('userSecret');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        if (data !== undefined) backend.local.set('user::secret', data);
        data = backend.local.get('user::secret');
        if (data === null)
            return {
                status: 'failed',
            };
        return {
            status: 'loaded',
            data: data,
        };
    } finally {
        backend.local.unlock('userSecret');
    }
}

userSecret.init = async (keyStore, settings) => {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('initUserSecret');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        let data = backend.local.get('user::secret');
        if (data === null) {
            data = buf2base32(b642buf(randomBytes(10)));
            backend.local.set('user::secret', data);
        }
        return {
            status: 'loaded',
            data: data,
        };
    } finally {
        backend.local.unlock('initUserSecret');
    }
};

userSecret.actionName = 'userSecret';
