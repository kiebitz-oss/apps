// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify, ecdhDecrypt } from 'helpers/crypto';
import { markAsLoading } from 'helpers/actions';

export async function providers(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);
    try {
        const providersList = await backend.appointments.getPendingProviderData(
            { n: 10 },
            keyPairs.signing
        );
        const invalidEntries = [];
        const decryptedProviderList = [];
        for (const entry of providersList) {
            try {
                const decryptedJSONData = await ecdhDecrypt(
                    entry.encryptedData,
                    keyPairs.provider.privateKey
                );
                const decryptedData = JSON.parse(decryptedJSONData);
                decryptedData.entry = entry;
                decryptedProviderList.push(decryptedData);
            } catch (e) {
                console.log(e);
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

providers.actionName = 'providers';
