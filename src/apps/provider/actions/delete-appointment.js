// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function deleteAppointment(
    state,
    keyStore,
    settings,
    appointment
) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
        let openAppointments = backend.local.get(
            'provider::appointments::open'
        );
        openAppointments = openAppointments.filter(
            oa => oa.id !== appointment.id
        );
        backend.local.set('provider::appointments::open', openAppointments);
    } finally {
        backend.local.unlock();
    }
}

deleteAppointment.actionName = 'deleteAppointment';
