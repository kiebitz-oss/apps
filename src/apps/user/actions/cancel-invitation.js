// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ephemeralECDHEncrypt } from 'helpers/crypto';

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
        await backend.local.lock();
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const [encryptedProviderData, _] = await ephemeralECDHEncrypt(
            JSON.stringify({ cancel: true }),
            acceptedInvitation.invitation.publicKey
        );

        const id = acceptedInvitation.slotData.id;

        try {
            const result = await backend.appointments.storeData(
                {
                    id: id,
                    data: encryptedProviderData,
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
        backend.local.unlock();
    }
}

cancelInvitation.init = (ks, settings) => ({
    status: 'loaded',
    data: settings.get('backend').local.get('user::invitation::accepted'),
});

cancelInvitation.actionName = 'cancelInvitation';
