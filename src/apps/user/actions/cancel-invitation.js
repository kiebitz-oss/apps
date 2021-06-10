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
        await backend.local.lock();

        const [encryptedProviderData, _] = await ephemeralECDHEncrypt(
            JSON.stringify({ cancel: true }),
            acceptedInvitation.invitation.publicKey
        );

        const cancelID = acceptedInvitation.slotData.cancel;

        const grant = acceptedInvitation.offer.grants.find(grant => {
            const grantData = JSON.parse(grant.data);
            if (grantData.objectID === cancelID) return true;
        });

        if (grant === undefined) {
            return {
                status: 'failed',
            };
        }

        try {
            const result = await backend.appointments.storeData(
                {
                    id: cancelID,
                    data: encryptedProviderData,
                    grant: grant,
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

        backend.local.set('user::invitation::accepted', null);

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
