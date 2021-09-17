// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function invitation(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('invitation');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        let invitations = backend.local.get('user::invitation::verified', []);
        if (!(invitations instanceof Array)) {
            invitations = [invitations];
        }
        return {
            status: 'loaded',
            data: invitations,
        };
    } finally {
        backend.local.unlock('invitation');
    }
}

invitation.actionName = 'invitation';
