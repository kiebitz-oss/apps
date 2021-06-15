// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function confirmDeletion(state, keyStore, settings) {
    const backend = settings.get('backend');
    backend.local.set('user::invitation::accepted', null);
    return {
        status: 'succeeded',
    };
}

confirmDeletion.actionName = 'confirmDeletion';
