// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function getAppointments(state, keyStore, settings, queueData) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('getAppointments');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        keyStore.set({ status: 'submitting' });
        const tokenData = backend.local.get('user::tokenData');

        if (tokenData === null) {
            return {
                status: 'failed',
            };
        }

        try {
            // we already have a token, we just renew it
            const result = await backend.appointments.getAppointmentsByZipCode({
                zipCode: queueData.zipCode,
            });

            console.log(result);

            return {
                data: tokenData,
                status: 'suceeded',
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e,
            };
        }
    } finally {
        backend.local.unlock('getAppointments');
    }
}

getAppointments.reset = () => ({ status: 'initialized' });

getAppointments.actionName = 'getAppointments';
