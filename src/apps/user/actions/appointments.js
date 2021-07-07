// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function appointments(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('appointments');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        let appointments = backend.local.get(
            'user::appointments::verified',
            []
        );
        if (!(appointments instanceof Array)) {
            appointments = [appointments];
        }
        return {
            status: 'loaded',
            data: appointments,
        };
    } finally {
        backend.local.unlock('appointments');
    }
}

appointments.actionName = 'appointments';
