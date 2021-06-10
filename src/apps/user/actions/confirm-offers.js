// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ephemeralECDHEncrypt } from 'helpers/crypto';

export async function confirmOffers(
    state,
    keyStore,
    settings,
    offers,
    invitation,
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
            invitation.publicKey
        );
        for (const offer of offers) {
            try {
                for (let i = 0; i < offer.slotData.length; i++) {
                    const slotData = offer.slotData[i];
                    if (slotData.failed || !slotData.open) continue;
                    const grant = offer.grants.find(grant => {
                        const data = JSON.parse(grant.data);
                        return data.objectID === slotData.id;
                    });
                    if (grant === undefined) continue;
                    try {
                        const result = await backend.appointments.storeData(
                            {
                                id: slotData.id,
                                data: encryptedProviderData,
                                grant: grant,
                            },
                            tokenData.signingKeyPair
                        );
                    } catch (e) {
                        slotData.failed = true;
                        backend.local.set(
                            'user::invitation::verified',
                            invitation
                        );
                        // we can't use this slot, we try the next...
                        console.error(e);
                        continue;
                    }
                    // we store the information about the offer which we've accepted
                    backend.local.set('user::invitation::accepted', {
                        offer: offer,
                        invitation: invitation,
                        slotData: slotData,
                        grant: grant,
                    });
                    return {
                        status: 'succeeded',
                        data: {
                            offer: offer,
                            slotData: slotData,
                        },
                    };
                }
            } catch (e) {
                console.error(e);
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

confirmOffers.actionName = 'confirmOffers';
