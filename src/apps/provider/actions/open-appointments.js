// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { buf2base32, b642buf } from 'helpers/conversion';
import { randomBytes } from 'helpers/crypto';

export async function openAppointments(state, keyStore, settings) {
    const backend = settings.get('backend');
    return {
        status: 'loaded',
        data: backend.local.get('provider::appointments::open', []),
    };
}

openAppointments.actionName = 'openAppointments';
