// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ephemeralECDHEncrypt } from 'helpers/crypto';
import { confirmUserOffers } from 'kiebitz/user/invitation';

export async function confirmOffers(state, keyStore, settings, offers, invitation, tokenData) {
    const providerData = {
        signedToken: tokenData.signedToken,
        userData: tokenData.hashData,
    };

    const [encryptedProviderData] = await ephemeralECDHEncrypt(JSON.stringify(providerData), invitation.publicKey);
    const data = await confirmUserOffers(offers, encryptedProviderData, invitation, tokenData);
    if (data) {
        return {
            status: 'succeeded',
            data,
        };
    }

    return {
        status: 'failed',
    };
}

confirmOffers.init = () => ({ status: 'initialized' });

confirmOffers.actionName = 'confirmOffers';
