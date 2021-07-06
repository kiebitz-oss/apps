// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign, ecdhDecrypt, ephemeralECDHEncrypt } from 'helpers/crypto';

export async function testQueues(state, keyStore, settings, keyPairs, data) {
    if (data === undefined) return { status: 'initialized' };
    for (const queue of data.queues) {
        try {
            const queuePrivateKey = await ecdhDecrypt(
                queue.encryptedPrivateKey,
                keyPairs.data.queue.privateKey
            );
            if (queuePrivateKey === null) {
                return { status: 'invalid' };
            }
        } catch (e) {
            return { status: 'invalid' };
        }
    }

    return { status: 'valid' };
}

testQueues.init = (keyStore, settings) => {
    return {
        status: 'initialized',
    };
};
testQueues.actionName = 'testQueues';
