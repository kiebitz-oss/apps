// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { generateECDHKeyPair, generateECDSAKeyPair } from 'helpers/crypto';
import { markAsLoading } from 'helpers/actions';

// make sure the signing and encryption key pairs exist
export async function keyPairs(state, keyStore, settings, data) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('keyPairs');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        markAsLoading(state, keyStore);

        if (data !== undefined) backend.local.set('mediator::keyPairs', data);

        let mediatorKeyPairs = backend.local.get('mediator::keyPairs');

        if (mediatorKeyPairs === null && settings.get('test') === true) {
            const signingKeyPair = await generateECDSAKeyPair();
            const encryptionKeyPair = await generateECDHKeyPair();
            await backend.appointments.initialized();

            let mediatorKeyPairs = {
                signing: signingKeyPair,
                encryption: encryptionKeyPair,
                provider: backend.appointments.providerDataEncryptionKeyPair,
                queue: backend.appointments.queueKeyEncryptionKeyPair,
            };
            backend.local.set('mediator::keyPairs', mediatorKeyPairs);
        }

        // in the test environment we automatically add the mediator keys to
        // the public key list and sign them with the root key so that they're
        // accepted as valid keys...
        if (settings.get('test')) {
            await backend.appointments.addMediatorPublicKeys({
                keys: mediatorKeyPairs,
            });
        }

        return { status: 'loaded', data: mediatorKeyPairs };
    } finally {
        backend.local.unlock('keyPairs');
    }
}

keyPairs.actionName = 'keyPairs';
