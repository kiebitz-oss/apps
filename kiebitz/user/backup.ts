import settings from 'helpers/settings';

import { aesEncrypt, aesDecrypt, deriveSecrets } from 'helpers/crypto';
import { base322buf, b642buf } from 'helpers/conversion';

// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
const KEY_BACKEND = 'backend';

export const initLocalStorageFromSecret = async (secret: any, keys: string[]): Promise<any> => {
    const backend = settings.get(KEY_BACKEND);
    try {
        await backend.local.lock('restoreFromBackup');

        const [id, key] = await deriveSecrets(base322buf(secret), 32, 2);
        const data = await backend.storage.getSettings({ id });
        const dd = JSON.parse(await aesDecrypt(data, b642buf(key)));

        for (const key of keys) {
            backend.local.set(`user::${key}`, dd[key]);
        }

        return dd;
    } finally {
        backend.local.unlock('restoreFromBackup');
    }
};

export const exportLocalStorageToSecret = async (secret: any, keys: string[]): Promise<any> => {
    const backend = settings.get(KEY_BACKEND);
    try {
        await backend.local.lock();

        const data: any = {};
        for (const key of keys) {
            data[key] = backend.local.get(`user::${key}`);
        }

        const fullData = {
            ...data,
            version: '0.1',
            createdAt: new Date().toISOString(),
        };

        const [id, key] = await deriveSecrets(base322buf(secret), 32, 2);
        const encryptedData = await aesEncrypt(JSON.stringify(fullData), b642buf(key));

        // TODO: There was a conditional return here before related to state.
        // Does it matter that we run the rest?
        // if (state !== undefined && state.referenceData != undefined) {
        //     if (JSON.stringify(state.referenceData) === JSON.stringify(referenceData)) {
        //         return state;
        //     }
        // }

        // TODO: Is this line needed?
        await backend.storage.storeSettings({ id, data: encryptedData });

        return [data, encryptedData];
    } finally {
        backend.local.unlock();
    }
};
