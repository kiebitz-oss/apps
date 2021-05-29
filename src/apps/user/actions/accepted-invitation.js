// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function acceptedInvitation(state, keyStore, settings) {
    const backend = settings.get('backend');
    return {
        status: 'loaded',
        data: backend.local.get('user::invitation::accepted'),
    };
}

acceptedInvitation.init = (ks, settings) => ({
    status: 'loaded',
    data: settings.get('backend').local.get('user::invitation::accepted'),
});
