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
        await backend.local.lock();

        const data = await backend.appointments.getData({ id: tokenData.tokenData.id }, tokenData.signingKeyPair);
        if (data === null) {
            return {
                status: 'not-found',
            };
        }

        const decryptedData = await decryptInvitationData(data, keys, tokenData);

        await verifyProviderData(decryptedData.provider);

        await setUserInvitation(data);
        await setUserInvitationVerified(decryptedData);

        return {
            status: 'loaded',
            data: decryptedData,
        };
    } finally {
        backend.local.unlock();
    }
};

export const confirmUserOffer = async (slotData, encryptedProviderData, grant, tokenData) => {
    const backend = settings.get(KEY_BACKEND);
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

        return await backend.appointments.storeData(
            {
                id: slotData.id,
                data: encryptedProviderData,
                grant: grant,
            },
            tokenData.signingKeyPair
        );
    } finally {
        backend.local.unlock();
    }
};

export const confirmUserOffers = async (offers, encryptedProviderData, invitation, tokenData) => {
    const backend = settings.get(KEY_BACKEND);
    for (const offer of offers) {
        try {
            for (let i = 0; i < offer.slotData.length; i++) {
                const slotData = offer.slotData[i];
                const grant = offer.grants.find((grant) => {
                    const data = JSON.parse(grant.data);
                    return data.objectID === slotData.id;
                });
                if (grant === undefined) continue;
                try {
                    await confirmUserOffer(slotData, encryptedProviderData, grant, tokenData);
                } catch (e) {
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
                return {
                    offer,
                    slotData,
                };
            }
        } catch (error) {
            console.error(error);
        }
    }
};
