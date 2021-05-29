import { generateECDHKeyPair, generateECDSAKeyPair } from 'helpers/crypto';

import { markAsLoading } from 'helpers/actions';

// make sure the signing and encryption key pairs exist
export async function keyPairs(state, keyStore, settings) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

        const providerKeyPairs = backend.local.get('provider::keyPairs');

        markAsLoading(state, keyStore);

        if (providerKeyPairs === null) {
            try {
                const encryptionKeyPair = await generateECDSAKeyPair();
                const signingKeyPair = await generateECDHKeyPair();
                const keyPairs = {
                    signing: signingKeyPair,
                    encryption: encryptionKeyPair,
                };
                backend.local.set('provider::keyPairs', keyPairs);
                return {
                    status: 'loaded',
                    data: keyPairs,
                };
            } catch (e) {
                return {
                    status: 'failed',
                    error: e.toString(),
                };
            }
        } else {
            return {
                status: 'loaded',
                data: providerKeyPairs,
            };
        }
    } finally {
        backend.local.unlock();
    }
}
