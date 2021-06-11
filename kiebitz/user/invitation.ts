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
        if (data === null)
            return {
                status: 'not-found',
            };

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
