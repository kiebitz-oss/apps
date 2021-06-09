// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserInvitationVerified } from '../business-logic/invitation';

export async function invitation(state, keyStore, settings) {
    return {
        status: 'loaded',
        data: getUserInvitationVerified,
    };
}

invitation.actionName = 'invitation';
