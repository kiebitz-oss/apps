// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserSecret, initUserSecret, setUserSecret } from '../../../../kiebitz/user/user-secret';

export async function userSecret(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('userSecret');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        if (data !== undefined) {
            setUserSecret(data);
        }

        data = getUserSecret();

        if (data === null) {
            return {
                status: 'failed',
            };
        }

        return {
            status: 'loaded',
            data,
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
        const data = initUserSecret();

        return {
            status: 'loaded',
            data,
        };
    } finally {
        backend.local.unlock('initUserSecret');
    }
};

userSecret.actionName = 'userSecret';
