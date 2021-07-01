// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from 'helpers/crypto';

export async function contactData(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('contactData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        // we just store the data...
        if (data !== undefined)
            backend.temporary.set('user::contactData', data);
        data = backend.temporary.get('user::contactData');
        if (data === null)
            return {
                status: 'failed',
            };
        return {
            status: 'loaded',
            data: data,
        };
    } finally {
        backend.local.unlock('contactData');
    }
}

contactData.actionName = 'contactData';

contactData.init = async (keyStore, settings) => {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('initContactData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        let data = backend.local.get('user::contactData');
        if (data === null) {
            data = {
                // the grant seed is used to generate grant IDs for this user.
                // It is accessible only by the provider, ensuring that the backend
                // cannot associate a given grant with a specific token (as with
                // version 0.2)
                grantSeed: randomBytes(32),
            };
            backend.local.set('user::contactData', data);
        }
        return {
            status: 'loaded',
            data: data,
        };
    } finally {
        backend.local.unlock('initContactData');
    }
};
