// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserInvitationAccepted } from '../../../../kiebitz/user/invitation';

export async function acceptedInvitation(state, keyStore, settings) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('acceptedInvitation');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        return {
            status: 'loaded',
            data: getUserInvitationAccepted(),
        };    
    } finally {
        backend.local.unlock('acceptedInvitation');
    }
}

acceptedInvitation.init = async (ks, settings) => { 
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('initAcceptInvitation');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {

    
        return {
            status: 'loaded',
            data: getUserInvitationAccepted(),
        };
    } finally {
        backend.local.unlock('initAcceptInvitation');
    }
};

acceptedInvitation.actionName = 'acceptedInvitation';
