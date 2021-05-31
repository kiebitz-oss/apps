// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { generateECDHKeyPair, generateECDSAKeyPair } from 'helpers/crypto';
import { markAsLoading } from 'helpers/actions';

// make sure the signing and encryption key pairs exist
export async function keyPairs(state, keyStore, settings) {
    const backend = settings.get('backend');
    let providerKeyPairs = backend.local.get('mediator::keyPairs');
    markAsLoading(state, keyStore);

    if (providerKeyPairs === null) {
        const encryptionKeyPair = await generateECDSAKeyPair();
        const signingKeyPair = await generateECDHKeyPair();
        let providerKeyPairs = {
            signing: signingKeyPair,
            encryption: encryptionKeyPair,
        };
        backend.local.set('mediator::keyPairs', providerKeyPairs);
    }

    // in the test environment we automatically add the mediator keys to
    // the public key list and sign them with the root key so that they're
    // accepted as valid keys...
    if (settings.get('test')) {
        await backend.appointments.addMediatorPublicKeys({
            keys: providerKeyPairs,
        });
    }

    return { status: 'loaded', data: providerKeyPairs };
}
