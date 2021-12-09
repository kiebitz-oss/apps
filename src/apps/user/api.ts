import { aesEncrypt, deriveSecrets } from 'helpers/crypto';
import { base322buf, buf2base32, b642buf } from 'helpers/conversion';
import {
    generateECDHKeyPair,
    generateECDSAKeyPair,
    hashString,
    randomBytes,
} from 'helpers/crypto';
import type { Invitation, QueueData, TokenData } from 'types';
import storage from 'backend/storage';
import appointments from 'backend/appointments';

const getLocalStorage = <R = unknown>(
    key: string,
    defaultValue?: R
): R | null => {
    const data = localStorage.getItem(`local::user::${key}`);

    if (data !== null) {
        return JSON.parse(data) as R;
    }

    if (defaultValue !== undefined) {
        return defaultValue;
    }

    return null;
};

const setLocalStorage = <V = string | number | boolean>(
    key: string,
    value: V
): void => {
    localStorage.setItem(`local::user::${key}`, JSON.stringify(value));
};

const removeLocalStorage = (key: string) => {
    return localStorage.removeItem(`local::user::${key}`);
};

////////////////////////////////////////////////////

const lock = (name: string) => {
    setLocalStorage(name, true);

    return Promise.resolve();
};

const unlock = (name: string) => {
    removeLocalStorage(name);
};

////////////////////////////////////////////////////

export const getSecret = () => {
    return getLocalStorage<string>('secret');
};

export const initSecret = async () => {
    try {
        // we lock the local backend to make sure we don't have any data races
        await lock('initUserSecret');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        let data = getSecret();

        if (data === null) {
            data = buf2base32(b642buf(randomBytes(10)));

            setLocalStorage('local::user::secret', data);
        }

        return data;
    } finally {
        unlock('initUserSecret');
    }
};

////////////////////////////////////////////////////

export const getTokenData = () => {
    return getLocalStorage<TokenData>('tokenData');
};

////////////////////////////////////////////////////

export const getQueueData = () => {
    return getLocalStorage<QueueData>('queueData');
};

export const setQueueData = (queueData: QueueData) => {
    return setLocalStorage<QueueData>('queueData', queueData);
};

////////////////////////////////////////////////////

export const getContactData = () => {
    return getLocalStorage<TokenData>('contactData');
};

////////////////////////////////////////////////////

export const getAcceptedInvitations = () => {
    return getLocalStorage('invitation::accepted');
};

////////////////////////////////////////////////////

export const getInvitations = () => {
    return getLocalStorage<Invitation[]>('appointments::verified');
};

////////////////////////////////////////////////////

async function hashContactData(data) {
    const hashData = {
        name: data.name,
        grantSeed: data.grantSeed,
        nonce: randomBytes(32),
    };

    const hashDataJSON = JSON.stringify(hashData);
    const dataHash = await hashString(hashDataJSON);
    return [dataHash, hashData.nonce];
}

export const getToken = async () => {
    try {
        const contactData = await getContactData();
        // we hash the user data to prove it didn't change later...
        const [dataHash, nonce] = await hashContactData(contactData);
        const signingKeyPair = await generateECDSAKeyPair();
        const encryptionKeyPair = await generateECDHKeyPair();
        const secret = await getSecret();

        const userToken = {
            // we use the user secrets first 4 digits as a code
            // this weakens the key a bit but the provider has access to all
            // of the user's appointment data anyway...
            code: secret.slice(0, 4),
            version: '0.3',
            createdAt: new Date().toISOString(),
            publicKey: signingKeyPair.publicKey, // the signing key to control the ID
            encryptionPublicKey: encryptionKeyPair.publicKey,
            id: randomBytes(32), // the ID where we want to receive data
        };

        const signedToken = await appointments.getToken({
            hash: dataHash,
            publicKey: signingKeyPair.publicKey,
            code: contactData.code,
        });

        const tokenData = {
            createdAt: new Date().toISOString(),
            signedToken: signedToken,
            signingKeyPair: signingKeyPair,
            keyPair: encryptionKeyPair,
            hashNonce: nonce,
            dataHash: dataHash,
            tokenData: userToken,
        };

        setLocalStorage('tokenData', tokenData);

        return tokenData;
    } catch (error) {
        console.error(error);

        throw error;
    }
};

////////////////////////////////////////////////////

const backupKeys = [
    'tokenData',
    'queueData',
    'invitation',
    'invitation::verified',
    'invitation::accepted',
    'invitation::slots',
    'secret',
];

export const backupData = async () => {
    try {
        const data: Record<string, unknown> = {};
        const secret = await getSecret();

        for (const key of backupKeys) {
            data[key] = getLocalStorage(key);
        }

        const fullData = {
            ...data,
            version: '0.1',
            createdAt: new Date().toISOString(),
        };

        const [id, key] = await deriveSecrets(base322buf(secret), 32, 2);

        const encryptedData = await aesEncrypt(
            JSON.stringify(fullData),
            b642buf(key)
        );

        // if (state !== undefined && state.referenceData != undefined) {
        //     if (JSON.stringify(state.referenceData) === JSON.stringify(data)) {
        //         return state;
        //     }
        // }

        await storage.storeSettings({ id: id, data: encryptedData });

        return {
            status: 'succeeded',
            data: encryptedData,
            referenceData: data,
        };
    } catch (error) {
        console.error(error);

        throw error;
    }
};
