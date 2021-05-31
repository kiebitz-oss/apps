// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from 'helpers/crypto';

export async function updateAppointments(state, keyStore, settings, schedule) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

        const openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );
        if (openAppointments.length >= 10) return { data: openAppointments };
        let d = new Date('2021-05-31T10:00:00+02:00');
        for (let i = 0; i < 10 - openAppointments.length; i++) {
            const dt = new Date(d.getTime() + 30 * 1000 * 60 * i);
            openAppointments.push({
                id: randomBytes(32), // where the user can submit his confirmation
                status: randomBytes(32), // where the user can get the appointment status
                cancel: randomBytes(32), // where the user can cancel his confirmation
                date: dt.toISOString(),
                duration: 60, // estimated duration
                cancelable_until: '2021-05-27T10:00:00Z',
            });
        }
        console.log(openAppointments);
        backend.local.set('provider::appointments::open', openAppointments);
        return {
            status: 'loaded',
            data: openAppointments,
        };
    } finally {
        backend.local.unlock();
    }
}
