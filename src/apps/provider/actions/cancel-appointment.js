// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function cancelAppointment(
    state,
    keyStore,
    settings,
    appointment
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('canceledAppointment');
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
            (ap) => ap.id === appointment.id
        );

        if (canceledAppointment === undefined)
            return {
                status: 'failed',
            };

        const otherAppointments = openAppointments.filter(
            (ap) => ap.id !== appointment.id
        );

        // we simply remove all slots
        canceledAppointment.slots = 0;
        canceledAppointment.slotData = [];
        canceledAppointment.modified = true;

        // we push the modified appointment
        otherAppointments.push(canceledAppointment);
        backend.local.set('provider::appointments::open', otherAppointments);

        return {
            status: 'suceeded',
            data: otherAppointments,
        };
    } finally {
        backend.local.unlock('canceledAppointment');
    }
}

cancelAppointment.actionName = 'cancelAppointment';
