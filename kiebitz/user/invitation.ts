import settings from 'helpers/settings';
import { verifyProviderData, decryptInvitationData } from './crypto';

// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
const KEY_BACKEND = 'backend';

export const KEY_USER_INVITATION = 'user::invitation';
export const KEY_USER_INVITATION_ACCEPTED = 'user::invitation::accepted';
export const KEY_USER_INVITATION_VERIFIED = 'user::invitation::verified';

export const setUserInvitation = (data: any): any => {
    const backend = settings.get(KEY_BACKEND);
    backend.local.set(KEY_USER_INVITATION, data);
};

export const getUserInvitationAccepted = (): any => {
    const backend = settings.get(KEY_BACKEND);
    return backend.local.get(KEY_USER_INVITATION_ACCEPTED);
};

export const setUserInvitationVerified = (data: any): any => {
    const backend = settings.get(KEY_BACKEND);
    backend.local.set(KEY_USER_INVITATION_VERIFIED, data);
};

export const getUserInvitationVerified = (): any => {
    const backend = settings.get(KEY_BACKEND);
    return backend.local.get(KEY_USER_INVITATION_VERIFIED);
};

export const getUserDecryptedInvitationData = async (keys: any, tokenData: any): Promise<any> => {
    const backend = settings.get(KEY_BACKEND);
    // Make sure we don't have any data races.

    try {
        // TODO: If fails throw null error.
        await backend.local.lock('checkInvitationData');

        const dataIDs = await deriveSecrets(
            b642buf(tokenData.tokenData.id),
            32,
            20
        );

        
        const dataList = await backend.appointments.bulkGetData(
            { ids: [tokenData.tokenData.id, ...dataIDs] },
            tokenData.signingKeyPair
        );

        backend.local.set('user::invitation', dataList);

        let decryptedDataList: any[] = [];
        for (const data of dataList) {
            if (data === null) continue;
            try {
                const decryptedData = await decryptInvitationData(
                    data,
                    keys,
                    tokenData
                );
                verifyProviderData(decryptedData.provider);
                decryptedDataList = [...decryptedDataList, decryptedData];
            } catch (e) {
                continue;
            }
        }

        
        await setUserInvitationVerified(decryptedDataList);
        return decryptedDataList;
        
    } finally {
        backend.local.unlock();
    }
};

export const confirmUserOffer = async (slotData, encryptedProviderData, grant, tokenData) => {
    const backend = settings.get(KEY_BACKEND);

    return await backend.appointments.storeData(
        {
            id: slotData.id,
            data: encryptedProviderData,
            grant: grant,
        },
        tokenData.signingKeyPair
    );
   
};

export const confirmUserOffers = async (offers, encryptedProviderData, invitation, tokenData) => {
    const backend = settings.get(KEY_BACKEND);

    const slotInfos = backend.local.get('user::invitation::slots', {});
    const grantID = backend.local.get('user::invitation::grantID');

    try {
        await backend.local.lock('confirmOffers');

        for (const offer of offers) {
            try {
                for (let i = 0; i < offer.slotData.length; i++) {
                    const slotData = offer.slotData[i];
                    if (slotData.failed || !slotData.open) {
                        continue;
                    }
                    const grant = offer.grants.find((grant) => {
                        const data = JSON.parse(grant.data);
                        return data.objectID === slotData.id;
                    });
                    const slotInfo = slotInfos[slotData.id];
                    if (slotInfo !== undefined) {
                        if (slotInfo.status === 'taken') continue; // this slot is taken already, we skip it
                    }
                    if (grant === undefined) continue;
                    const grantData = JSON.parse(grant.data);
                    if (grantID !== null && grantData.grantID === grantID) {
                       continue; // this belongs to an old grant ID
                    }
    
                    try {
                        await confirmUserOffer(slotData, encryptedProviderData, grant, tokenData);
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
                    backend.local.set(KEY_USER_INVITATION_ACCEPTED, {
                        offer,
                        invitation,
                        slotData,
                        grant,
                    });
    
                    backend.local.set(
                        'user::invitation::grantID',
                        grantData.grantID
                    );
    
                    
                    
                    
                    return {
                        offer,
                        slotData,
                    };
                }
            } catch (error) {
                console.error(error);
            }
        }
    } finally {
        backend.local.set('user::invitation::slots', slotInfos);

        backend.local.unlock('confirmOffers');
    }    
};
