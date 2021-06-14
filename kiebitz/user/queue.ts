import settings from 'helpers/settings';
import { ephemeralECDHEncrypt, generateECDSAKeyPair, randomBytes } from 'helpers/crypto';

import { hashContactData } from './crypto';
import { getUserTokenData } from './token-data';
import { GetQueueResponse } from 'kiebitz/provider/queues';

// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
const KEY_BACKEND = 'backend';

export const KEY_USER_QUEUE_DATA = 'user::queueData';

export interface UserQueueData {
    accessible: boolean;
    distance: number;
    zipCode: string;
}

export interface UserContactData {
    code: string;
    [x: string]: any;
}

export const getUserTemporaryQueueData = async (): Promise<UserQueueData> => {
    const backend = settings.get(KEY_BACKEND);
    return backend.temporary.get(KEY_USER_QUEUE_DATA);
};

export const setUserTemporaryQueueData = async (data: UserQueueData): Promise<any> => {
    const backend = settings.get(KEY_BACKEND);
    backend.temporary.set(KEY_USER_QUEUE_DATA, data);
};

export const getUserAppointmentsTokenDataWithSignedToken = async (
    contactData: UserContactData,
    queueData: UserQueueData,
    queue: GetQueueResponse,
    userSecret: string
): Promise<any> => {
    const backend = settings.get(KEY_BACKEND);

    try {
        await backend.local.lock();

        const tokenData = await getUserTokenData();
        if (tokenData !== null) {
            // We already have a token, so we submit to another queue.
            tokenData.signedToken = await backend.appointments.getToken({
                hash: tokenData.dataHash,
                code: contactData.code,
                encryptedData: tokenData.encryptedTokenData,
                queueID: queue.id,
                queueData: queueData,
                signedTokenData: tokenData.signedToken,
            });

            backend.local.set('user::tokenData', tokenData);
            return tokenData;
        } else {
            // we hash the user data to prove it didn't change later...
            const [dataHash, nonce] = await hashContactData(contactData);
            const signingKeyPair = await generateECDSAKeyPair();

            const userToken = {
                // we use the user secrets first 4 digits as a code
                // this weakens the key a bit but the provider has access to all
                // of the user's appointment data anyway...
                code: userSecret.slice(0, 4),
                publicKey: signingKeyPair.publicKey, // the signing key to control the ID
                id: randomBytes(32), // the ID where we want to receive data
            };

            // we encrypt the token data so the provider can decrypt it...
            const [encryptedTokenData, privateKey] = await ephemeralECDHEncrypt(
                JSON.stringify(userToken),
                queue.publicKey
            );

            // currently we don't give the provider any infos...
            const contactDataForProvider = {};

            // we also encrypt the contact data for the provider...
            // this won't get sent to the provider immediately though...
            const [encryptedContactData] = await ephemeralECDHEncrypt(
                JSON.stringify(contactDataForProvider),
                queue.publicKey
            );

            const signedToken = await backend.appointments.getToken({
                hash: dataHash,
                code: contactData.code,
                encryptedData: encryptedTokenData,
                queueID: queue.id,
                queueData: queueData,
            });

            const newTokenData = {
                signedToken: signedToken,
                signingKeyPair: signingKeyPair,
                encryptedTokenData: encryptedTokenData,
                encryptedContactData: encryptedContactData,
                queueData: queueData,
                privateKey: privateKey,
                hashNonce: nonce,
                dataHash: dataHash,
                tokenData: userToken,
            };

            backend.local.set('user::tokenData', newTokenData);
            return newTokenData;
        }
    } finally {
        backend.local.unlock();
    }
};
