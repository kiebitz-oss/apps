// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export async function queueKeyPair(state, keyStore, settings, data) {
    if (settings.get('test')) {
        // in the test mode the key is stored in the backend
        const backend = settings.get('backend');
        const keyPair = backend.appointments.queueKeyEncryptionKeyPair;
        return {
            status: keyPair !== undefined ? 'loaded' : 'failed',
            data: keyPair,
        };
    }
    return {
        status: 'failed',
    };
}
