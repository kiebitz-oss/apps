// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt } from 'helpers/crypto';

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
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    const slotInfos = backend.local.get('user::invitation::slots', {});
    const grantID = backend.local.get('user::invitation::grantID');

    try {
        const providerData = {
            signedToken: tokenData.signedToken,
            userData: tokenData.hashData,
        };

        const encryptedProviderData = await ecdhEncrypt(
            JSON.stringify(providerData),
            tokenData.keyPair,
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
                    const slotInfo = slotInfos[slotData.id];
                    if (slotInfo !== undefined) {
                        if (slotInfo.status === 'taken') continue; // this slot is taken already, we skip it
                    }
                    if (grant === undefined) continue;
                    const grantData = JSON.parse(grant.data);
                    if (grantID !== null && grantData.grantID === grantID)
                        continue; // this belongs to an old grant ID
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
                        if (
                            typeof e === 'object' &&
                            e.name === 'RPCException'
                        ) {
                            if (e.error.code === 401) {
                                slotInfos[slotData.id] = {
                                    status: 'taken',
                                };
                            } else {
                                slotInfos[slotData.id] = {
                                    status: 'error',
                                };
                            }
                        }
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

                    backend.local.set(
                        'user::invitation::grantID',
                        grantData.grantID
                    );
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
        backend.local.set('user::invitation::slots', slotInfos);

        backend.local.unlock();
    }
}

confirmOffers.init = () => ({ status: 'initialized' });

confirmOffers.actionName = 'confirmOffers';
