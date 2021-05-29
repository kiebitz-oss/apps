// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function schedule(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    let schedule = backend.local.get('provider::schedule');
    if (data !== null) {
        schedule = data;
        backend.local.set('provider::schedule', schedule);
    }
    return {
        status: 'loaded',
        data: schedule,
    };
}
