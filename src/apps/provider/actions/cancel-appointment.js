// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function cancelSlots(backend, slots, tokens) {
    if (backend !== undefined)
        tokens = backend.local.get('provider::tokens::open', []);
    for (const slot of slots) {
        if (slot.token !== undefined) {
            const existingToken = tokens.find(
                token => token.token === slot.token.token
            );
            if (existingToken !== undefined) {
                // we renew the grant IDs for the token, so the user can book another appointment
                existingToken.grantID = undefined;
                existingToken.expiresAt = undefined;
            }
        }
    }
    if (backend !== undefined)
        backend.local.set('provider::tokens::open', tokens);
}

export async function cancelAppointment(
    state,
    keyStore,
    settings,
    appointment
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );

        // we select the appointment from the "official" list as the given appointment might
        // contain enrichment data and e.g. cyclic data structures...
        const canceledAppointment = openAppointments.find(
            ap => ap.id === appointment.id
        );

        if (canceledAppointment === undefined)
            return {
                status: 'failed',
            };

        const otherAppointments = openAppointments.filter(
            ap => ap.id !== appointment.id
        );

        await cancelSlots(backend, canceledAppointment.slotData);

        // we simply remove all slots
        canceledAppointment.slots = 0;
        canceledAppointment.slotData = [];

        // we push the modified appointment
        otherAppointments.push(canceledAppointment);
        backend.local.set('provider::appointments::open', otherAppointments);

        return {
            status: 'suceeded',
            data: otherAppointments,
        };
    } finally {
        backend.local.unlock();
    }
}

cancelAppointment.actionName = 'cancelAppointment';
