// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify, ecdhDecrypt } from 'helpers/crypto';
import { markAsLoading } from 'helpers/actions';

export async function verifiedProviders(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');
    return await providers(state, keyStore, settings, keyPairs, (...args) =>
        backend.appointments.getVerifiedProviderData(...args)
    );
}

verifiedProviders.actionName = 'verifiedProviders';

export async function pendingProviders(state, keyStore, settings, keyPairs) {
    const backend = settings.get('backend');
    return await providers(state, keyStore, settings, keyPairs, (...args) =>
        backend.appointments.getPendingProviderData(...args)
    );
}

pendingProviders.actionName = 'pendingProviders';

async function providers(state, keyStore, settings, keyPairs, loader) {
    markAsLoading(state, keyStore);
    try {
        const providersList = await loader({ n: 10 }, keyPairs.signing);
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
                invalidEntries.push({
                    entry: entry,
                    error: e,
                });
            }
        }
        return {
            data: decryptedProviderList,
            invalidEntries: invalidEntries,
            status: 'loaded',
        };
    } catch (e) {
        console.error(e);
        return { status: 'failed', error: e };
    }
}
