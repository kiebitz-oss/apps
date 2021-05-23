// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { hashString, randomBytes, ephemeralECDHEncrypt } from 'helpers/crypto';
import { e } from 'helpers/async';

async function hashContactData(data) {
    const hashData = {
        name: data.name,
        nonce: randomBytes(32),
    };

    const hashDataJSON = JSON.stringify(hashData);
    const dataHash = await e(hashString(hashDataJSON));
    return [dataHash, hashData];
}

async function getTokenData(state, keyStore, settings, queue) {
    const data = {};
}

export async function submitToQueue(state, keyStore, settings, data, queue) {
    const backend = settings.get('backend');
    keyStore.set({ status: 'submitting' });
    let tokenData = backend.local.get('user::tokenData');
    if (tokenData !== null) {
        try {
            // we already have a token, we just submit to another queue
            const signedToken = await e(
                backend.appointments.getToken(
                    tokenData.dataHash,
                    tokenData.encryptedTokenData,
                    queue.id,
                    tokenData.signedToken
                )
            );
            return {
                data: signedToken,
                status: 'suceeded',
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e.toString(),
            };
        }
    }
    try {
        // we hash the user data to prove it didn't change later...
        const [dataHash, hashData] = await e(hashContactData(data));
        const tokenData = {
            id: randomBytes(32), // the ID where we want to receive data
        };
        const tokenDataJSON = JSON.stringify(tokenData);
        // we encrypt the token data so the provider can decrypt it...
        const [encryptedTokenData, privateKey] = await e(
            ephemeralECDHEncrypt(tokenDataJSON, queue.publicKey)
        );
        const signedToken = await e(
            backend.appointments.getToken(
                dataHash,
                encryptedTokenData,
                queue.id
            )
        );
        backend.local.set('user::tokenData', {
            signedToken: signedToken,
            hashData: hashData,
            dataHash: dataHash,
            tokenData: tokenData,
            encryptedTokenData: encryptedTokenData,
            privateKey: privateKey,
        });
        return {
            data: signedToken,
            status: 'succeeded',
        };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

export async function contactData(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    // we just store the data...
    if (data !== undefined) backend.local.set('user::contactData', data);
    return backend.local.get('user::contactData') || {};
}
