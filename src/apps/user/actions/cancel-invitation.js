// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt } from 'helpers/crypto';

export async function cancelInvitation(
    state,
    keyStore,
    settings,
    acceptedInvitation,
    tokenData
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('cancelInvitation');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const id = acceptedInvitation.offer.id;

        try {

            const result = await backend.appointments.cancelAppointment(
                {
                    id: id,
                    signedTokenData: tokenData.signedToken,
                    providerID: acceptedInvitation.invitation.provider.id,
                },
                tokenData.signingKeyPair
            );
        } catch (e) {
            console.error(e);
            return {
                status: 'failed',
                error: e,
            };
        }

        backend.local.set('user::invitation::verified', null);
        backend.local.set('user::invitation::accepted', null);
        backend.local.set('user::invitation', null);

        return {
            status: 'succeeded',
        };
    } catch (e) {
        console.error(e);
        return {
            status: 'failed',
            error: e,
        };
    } finally {
        backend.local.unlock('cancelInvitation');
    }
}

cancelInvitation.init = async (ks, settings) => {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('initCancelInvitation');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        return {
            status: 'loaded',
            data: backend.local.get('user::invitation::accepted'),
        };
    } finally {
        backend.local.unlock('initCancelInvitation');
    }
};

cancelInvitation.actionName = 'cancelInvitation';
