// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { e } from 'helpers/async';
import {
    verify,
    hash,
    ecdhDecrypt,
    ephemeralECDHEncrypt,
} from 'helpers/crypto';

export async function tokenData(state, keyStore, settings) {
    const backend = settings.get('backend');
    return {
        status: 'loaded',
        data: backend.local.get('user::tokenData'),
    };
}

async function decryptInvitationData(signedData, keys, tokenData) {
    let found = false;
    const keyHash = await e(hash(signedData.publicKey));
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

// to do: verify the provider data
async function verifyProviderData(providerData, keys) {}

export async function invitationData(state, keyStore, settings) {
    const backend = settings.get('backend');
    return {
        status: 'loaded',
        data: backend.local.get('user::invitationData::verified'),
    };
}

export async function acceptedInvitation(state, keyStore, settings) {
    const backend = settings.get('backend');
    return {
        status: 'loaded',
        data: backend.local.get('user::invitation::accepted'),
    };
}

acceptedInvitation.init = (ks, settings) => ({
    status: 'loaded',
    data: settings.get('backend').local.get('user::invitation::accepted'),
});

export async function confirmOffers(
    state,
    keyStore,
    settings,
    offers,
    invitationData,
    tokenData
) {
    const backend = settings.get('backend');
    const providerData = {
        signedToken: tokenData.signedToken,
        userData: tokenData.hashData,
    };
    const [encryptedProviderData, _] = await ephemeralECDHEncrypt(
        JSON.stringify(providerData),
        invitationData.publicKey
    );
    for (const offer of offers) {
        try {
            const result = await backend.appointments.storeData(
                offer.id,
                encryptedProviderData,
                tokenData.signingKeyPair,
                [],
                invitationData.grant
            );
            // we store the information about the offer which we've accepted
            backend.local.set('user::invitation::accepted', {
                offer: offer,
                invitationData: invitationData,
            });
            return {
                status: 'succeeded',
                data: offer,
            };
        } catch (e) {
            continue;
        }
    }
    return {
        status: 'failed',
    };
}

confirmOffers.init = () => ({ status: 'initialized' });

export async function checkInvitationData(
    state,
    keyStore,
    settings,
    keys,
    tokenData
) {
    const backend = settings.get('backend');
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
}
