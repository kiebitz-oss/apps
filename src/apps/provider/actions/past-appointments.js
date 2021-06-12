// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { buf2base32, b642buf } from 'helpers/conversion';
import { randomBytes } from 'helpers/crypto';
import { enrichAppointments } from './helpers';

export async function pastAppointments(state, keyStore, settings) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const appointments = backend.local.get(
            'provider::appointments::past',
            []
        );

        try {
            return {
                status: 'loaded',
                data: appointments,
                enrichedData: enrichAppointments(appointments),
            };
        } catch (e) {
            console.error(e);
        }
    } finally {
        backend.local.unlock();
    }
}

pastAppointments.actionName = 'pastAppointments';
