// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify, ecdhDecrypt } from 'helpers/crypto';
import { markAsLoading } from 'helpers/actions';

export async function providers(
    state,
    keyStore,
    settings,
    keyPairs,
    dataKeyPair
) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);
    try {
        const providersList = await backend.appointments.getPendingProviderData(
            keyPairs,
            10
        );
        const invalidEntries = [];
        const decryptedProviderList = [];
        for (const entry of providersList) {
            try {
                const result = await verify([entry.publicKey], entry);
                if (!result) {
                    // signature is invalid... Actually this is not really
                    // required here as the public key isn't verifiable
                    throw 'invalid signature';
                }
                const encryptedData = JSON.parse(entry.data);
                const decryptedJSONData = await ecdhDecrypt(
                    encryptedData,
                    dataKeyPair.privateKey
                );
                const decryptedData = JSON.parse(decryptedJSONData);
                decryptedData.entry = entry;
                decryptedProviderList.push(decryptedData);
            } catch (e) {
                invalidEntries.push({
                    entry: entry,
                    error: e.toString(),
                });
            }
        }
        return {
            data: decryptedProviderList,
            invalidEntries: invalidEntries,
            status: 'loaded',
        };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}
