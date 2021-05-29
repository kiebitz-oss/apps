// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ephemeralECDHEncrypt } from 'helpers/crypto';

export async function confirmOffers(
    state,
    keyStore,
    settings,
    offers,
    invitationData,
    tokenData
) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
        const providerData = {
            signedToken: tokenData.signedToken,
            userData: tokenData.hashData,
        };
        const [encryptedProviderData, _] = await ephemeralECDHEncrypt(
            JSON.stringify(providerData),
            invitationData.publicKey
        );
        for (const offer of offers) {
            try {
                console.log(offer);
                const result = await backend.appointments.storeData(
                    offer.id,
                    encryptedProviderData,
                    tokenData.signingKeyPair,
                    [],
                    offer.grant
                );
                // we store the information about the offer which we've accepted
                backend.local.set('user::invitation::accepted', {
                    offer: offer,
                    invitationData: invitationData,
                });
                return {
                    status: 'succeeded',
                    data: offer,
                };
            } catch (e) {
                continue;
            }
        }
        return {
            status: 'failed',
        };
    } finally {
        backend.local.unlock();
    }
}

confirmOffers.init = () => ({ status: 'initialized' });
