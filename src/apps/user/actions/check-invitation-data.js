// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { hash, verify, ecdhDecrypt } from 'helpers/crypto';

// to do: verify the provider data
async function verifyProviderData(providerData, keys) {}

async function decryptInvitationData(signedData, keys, tokenData) {
    let found = false;
    const keyHash = await hash(signedData.publicKey);
    for (const providerKeys of keys.lists.providers) {
        if (providerKeys.json.signing === keyHash) {
            found = true;
            break;
        }
    }
    if (!found) throw 'invalid key';
    const result = await verify([signedData.publicKey], signedData);
    if (!result) throw 'invalid signature';
    signedData.json = JSON.parse(signedData.data);
    const decryptedData = JSON.parse(
        await ecdhDecrypt(signedData.json, tokenData.privateKey)
    );
    // we store the public key as we need it to reply to the invitation
    decryptedData.publicKey = signedData.json.publicKey;
    return decryptedData;
}
export async function checkInvitationData(
    state,
    keyStore,
    settings,
    keys,
    tokenData
) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
        try {
            const data = await e(
                backend.appointments.getData(
                    tokenData.tokenData.id,
                    tokenData.signingKeyPair
                )
            );
            const decryptedData = await decryptInvitationData(
                data,
                keys,
                tokenData
            );
            verifyProviderData(decryptedData.provider);
            backend.local.set('user::invitationData', data);
            backend.local.set('user::invitationData::verified', decryptedData);
            return {
                status: 'loaded',
                data: decryptedData,
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e.toString(),
            };
        }
    } finally {
        backend.local.unlock();
    }
}
