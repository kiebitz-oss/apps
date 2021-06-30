// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { hash, verify, ecdhDecrypt, deriveSecrets } from 'helpers/crypto';
import { b642buf } from 'helpers/conversion';

// to do: verify the provider data
async function verifyProviderData(providerData, keys) {}

async function decryptInvitationData(signedData, keys, tokenData) {
    let found = false;
    for (const providerKeys of keys.lists.providers) {
        if (providerKeys.json.signing === signedData.publicKey) {
            found = true;
            break;
        }
    }
    if (!found) throw 'invalid key';
    const result = await verify([signedData.publicKey], signedData);
    if (!result) throw 'invalid signature';
    signedData.json = JSON.parse(signedData.data);
    const decryptedData = JSON.parse(
        await ecdhDecrypt(signedData.json, tokenData.keyPair.privateKey)
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
        await backend.local.lock('checkInvitationData');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        try {
            const dataIDs = await deriveSecrets(
                b642buf(tokenData.tokenData.id),
                32,
                20
            );

            const dataList = await backend.appointments.bulkGetData(
                { ids: [tokenData.tokenData.id, ...dataIDs] },
                tokenData.signingKeyPair
            );

            backend.local.set('user::invitation', dataList);

            const decryptedDataList = [];

            for (const data of dataList) {
                if (data === null) continue;
                try {
                    const decryptedData = await decryptInvitationData(
                        data,
                        keys,
                        tokenData
                    );
                    verifyProviderData(decryptedData.provider);
                    decryptedDataList.push(decryptedData);
                } catch (e) {
                    continue;
                }
            }

            backend.local.set('user::invitation::verified', decryptedDataList);
            return {
                status: 'loaded',
                data: decryptedDataList,
            };
        } catch (e) {
            console.error(e);
            return {
                status: 'failed',
                error: e,
            };
        }
    } finally {
        backend.local.unlock('checkInvitationData');
    }
}

checkInvitationData.actionName = 'checkInvitationData';
