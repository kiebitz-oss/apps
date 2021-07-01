// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function invitation(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    const invitations =  backend.local.get('user::invitation::verified');
    if (!(invitations instanceof Array)){
        invitations = [invitations]
    }
    return {
        status: 'loaded',
        data: invitations,
    };
}

invitation.actionName = 'invitation';
