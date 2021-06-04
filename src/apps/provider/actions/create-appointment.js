// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from 'helpers/crypto';

export async function createAppointment(
    state,
    keyStore,
    settings,
    appointment
) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

        const openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );
        const slotData = [];
        for (let i = 0; i < appointment.slots; i++) {
            slotData.push({
                open: true,
                id: randomBytes(32), // where the user can submit his confirmation
                status: randomBytes(32), // where the user can get the appointment status
                cancel: randomBytes(32), // where the user can cancel his confirmation
            });
        }
        openAppointments.push({
            slotData: slotData,
            ...appointment,
        });
        backend.local.set('provider::appointments::open', openAppointments);
        return {
            status: 'loaded',
            data: openAppointments,
        };
    } finally {
        backend.local.unlock();
    }
}

createAppointment.actionName = 'createAppointment';
