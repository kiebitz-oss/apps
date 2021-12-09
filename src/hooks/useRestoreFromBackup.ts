import { backupKeys } from 'apps/user/actions';
import { base322buf, b642buf } from 'helpers/conversion';
import { deriveSecrets, aesDecrypt } from 'helpers/crypto';
import { useBackend } from 'hooks';
import { useLock } from './useLock';

export const useRestoreFromBackup = async (secret: string) => {
    const backend = useBackend();

    return useLock('restoreFromBackup', async () => {
        try {
            const derivedSecrets = await deriveSecrets(
                base322buf(secret),
                32,
                2
            );

            if (!derivedSecrets) {
                throw new Error();
            }

            const [id, key] = derivedSecrets;

            const data = await backend.storage.getSettings({ id: id });

            if (!data || !key) {
                throw new Error();
            }

            const decryptedData = await aesDecrypt(data, b642buf(key));

            if (!decryptedData) {
                throw new Error();
            }

            const dd = JSON.parse(decryptedData);

            for (const key of backupKeys) {
                backend.local.set(`user::${key}`, dd[key]);
            }

            backend.local.set('user::secret', secret);

            return {
                status: 'succeeded',
                data: dd,
            };
        } catch (error) {
            console.error(error);

            return {
                status: 'failed',
                error: error,
            };
        }
    });
};
