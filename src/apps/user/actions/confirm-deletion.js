// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function confirmDeletion(state, keyStore, settings) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('confirmDeletion');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        backend.local.set('user::invitation::accepted', null);
        return {
            status: 'succeeded',
        };
    } finally {
        backend.local.unlock('confirmDeletion');
    }
}

confirmDeletion.actionName = 'confirmDeletion';
