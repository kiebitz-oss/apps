// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserInvitationAccepted } from '../business-logic/invitation';

export async function acceptedInvitation(state, keyStore, settings) {
    return {
        status: 'loaded',
        data: getUserInvitationAccepted(),
    };
}

acceptedInvitation.init = (ks, settings) => ({
    status: 'loaded',
    data: getUserInvitationAccepted(),
});

acceptedInvitation.actionName = 'acceptedInvitation';
