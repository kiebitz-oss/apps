// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    sign,
    hash,
    randomBytes,
    generateECDSAKeyPair,
    ephemeralECDHEncrypt,
    ecdhEncrypt,
    ecdhDecrypt,
    generateECDHKeyPair,
} from 'helpers/crypto';
import { e } from 'helpers/async';
import { markAsLoading } from 'helpers/actions';

// returns or updates the schedule
export async function schedule(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    let schedule = backend.local.get('provider::schedule');
    if (data !== null) {
        schedule = data;
        backend.local.set('provider::schedule', schedule);
    }
    return {
        status: 'loaded',
        data: schedule,
    };
}

export async function createAppointments(state, keyStore, settings) {}

function getQueuePrivateKey(queueID, verifiedProviderData) {
    for (const queueKeys of verifiedProviderData.queuePrivateKeys) {
        if (queueKeys.id === queueID) return queueKeys.privateKey;
    }
    return null;
}

export async function updateAppointments(state, keyStore, settings, schedule) {
    const backend = settings.get('backend');
    const openAppointments = backend.local.get(
        'provider::appointments::open',
        []
    );
    if (openAppointments.length >= 10) return { data: openAppointments };
    let d = new Date('2021-05-24T10:00:00+02:00');
    for (let i = 0; i < openAppointments.length - 10; i++) {
        const dt = new Date(d.getTime() + 30 * 1000 * 60 * i);
        openAppointments.push({
            id: randomBytes(32), // where the user can submit his confirmation
            status: randomBytes(32), // where the user can get the appointment status
            cancel: randomBytes(32), // where the user can cancel his confirmation
            date: dt.toISOString(),
            duration: 60, // estimated duration
            cancelable_until: '2021-05-27T10:00:00Z',
        });
    }
    backend.local.set('provider::appointments::open', openAppointments);
    return {
        status: 'loaded',
        data: openAppointments,
    };
}

// regularly checks open appointment slots
export async function sendInvitations(
    state,
    keyStore,
    settings,
    keyPairs,
    verifiedProviderData
) {
    const backend = settings.get('backend');
    let openAppointments = backend.local.get(
        'provider::appointments::open',
        []
    );
    let openTokens = backend.local.get('provider::tokens::open', []);
    if (openAppointments.length === 0)
        // we don't have any new appointments to give out
        return {
            status: 'succeeded',
        };
    try {
        const n = Math.max(0, openAppointments.length - openTokens.length);
        // we don't have enough tokens for our open appointments, we generate more
        if (n > 0) {
            const newTokens = await e(
                backend.appointments.getQueueTokens(
                    n,
                    verifiedProviderData.signedData.json.queues,
                    keyPairs.signing
                )
            );
            for (const token of newTokens) {
                token.keyPair = await e(generateECDHKeyPair());
            }
            openTokens = [...openTokens, ...newTokens];
            // we update the list of open tokens
            backend.local.set('provider::tokens::open', openTokens);
        }
        const dataToSubmit = [];
        // we make sure all token holders can initialize all appointment data IDs
        for (const token of openTokens) {
            const privateKey = getQueuePrivateKey(
                token.queue,
                verifiedProviderData
            );
            try {
                const decryptedTokenJSONData = await e(
                    ecdhDecrypt(token.token.encryptedData, privateKey)
                );
                const decryptedTokenData = JSON.parse(decryptedTokenJSONData);
                // we generate grants for all appointments IDs
                const grantsData = await Promise.all(
                    openAppointments.map(
                        async oa =>
                            await sign(
                                keyPairs.signing.privateKey,
                                JSON.stringify({
                                    rights: ['write', 'read', 'delete'],
                                    single_use: true,
                                    id: oa.id,
                                    permissions: [
                                        {
                                            rights: ['write', 'read', 'delete'],
                                            keys: [keyPairs.signing.publicKey],
                                        },
                                    ],
                                }),
                                keyPairs.signing.publicKey
                            )
                    )
                );
                const userData = {
                    provider: verifiedProviderData.signedData,
                    offers: openAppointments.map((oa, i) => {
                        const on = { ...oa };
                        on.grant = grantsData[i];
                        return on;
                    }),
                };
                // we first encrypt the data
                const encryptedUserData = await e(
                    ecdhEncrypt(
                        JSON.stringify(userData),
                        token.keyPair,
                        token.token.encryptedData.publicKey
                    )
                );
                // we sign the data with our private key
                const signedEncryptedUserData = await e(
                    sign(
                        keyPairs.signing.privateKey,
                        JSON.stringify(encryptedUserData),
                        keyPairs.signing.publicKey
                    )
                );
                dataToSubmit.push({
                    id: decryptedTokenData.id,
                    data: signedEncryptedUserData,
                    permissions: [
                        {
                            rights: ['read'],
                            keys: [decryptedTokenData.publicKey],
                        },
                    ],
                });
            } catch (e) {
                console.log(e.toString());
                continue;
            }
        }
        backend.local.set('provider::tokens::open', openTokens);
        // we send the signed, encrypted data to the backend
        await e(
            backend.appointments.bulkStoreData(keyPairs.signing, dataToSubmit)
        );

        return { status: 'succeeded' };
    } catch (e) {
        console.log(e.toString());
        return { status: 'failed', error: e.toString() };
    }
}

// checks invitations
export async function checkInvitations(
    state,
    keyStore,
    settings,
    keyPairs,
    invitations
) {
    const backend = settings.get('backend');
    let openTokens = backend.local.get('provider::tokens::open', []);
    let acceptedInvitations = backend.local.get(
        'provider::appointments::accepted',
        []
    );
    try {
        const results = await backend.appointments.bulkGetData(
            invitations.map(i => i.id),
            keyPairs.signing
        );
        for (const [i, result] of results.entries()) {
            if (result === null) continue;
            // we try to decrypt this data with the private key of each token
            for (const openToken of openTokens) {
                try {
                    const decryptedData = JSON.parse(
                        await ecdhDecrypt(result, openToken.keyPair.privateKey)
                    );
                    if (
                        acceptedInvitations.find(
                            ai => ai.token.token.token === openToken.token.token
                        )
                    )
                        continue;
                    acceptedInvitations.push({
                        token: openToken,
                        data: decryptedData,
                        invitation: invitations[i],
                    });
                } catch (e) {
                    continue;
                }
            }
        }

        // we update the list of accepted appointments
        backend.local.set(
            'provider::appointments::accepted',
            acceptedInvitations
        );

        // we remove the accepted appointments from the list of open appointments
        let openAppointments = backend.local.get(
            'provider::appointments::open',
            []
        );
        openAppointments = openAppointments.filter(
            oa => !acceptedInvitations.find(ai => ai.invitation.id === oa.id)
        );
        backend.local.set('provider::appointments::open', openAppointments);

        // we remove the tokens corresponding to the accepted invitations from
        // the list of open tokens...
        let openTokens = backend.local.get('provider::tokens::open', []);
        openTokens = openTokens.filter(
            ot =>
                !acceptedInvitations.find(
                    ai => ai.token.token.token === openToken.token.token
                )
        );
        backend.local.set('provider::tokens::open', openTokens);

        return {
            status: 'loaded',
            data: acceptedInvitations,
        };
    } catch (e) {}
}

// make sure the signing and encryption key pairs exist
export async function keyPairs(state, keyStore, settings) {
    const backend = settings.get('backend');
    const providerKeyPairs = backend.local.get('provider::keyPairs');

    markAsLoading(state, keyStore);

    if (providerKeyPairs === null) {
        try {
            const encryptionKeyPair = await e(generateECDSAKeyPair());
            const signingKeyPair = await e(generateECDHKeyPair());
            const keyPairs = {
                signing: signingKeyPair,
                encryption: encryptionKeyPair,
            };
            backend.local.set('provider::keyPairs', keyPairs);
            return {
                status: 'loaded',
                data: keyPairs,
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e.toString(),
            };
        }
    } else {
        return {
            status: 'loaded',
            data: providerKeyPairs,
        };
    }
}

export async function keys(state, keyStore, settings) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);
    console.log('getting keys...');
    try {
        const keys = await backend.appointments.getKeys();
        return {
            status: 'loaded',
            data: keys,
        };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

// generate and return the (local) verified provider data (if it exists)
export async function verifiedProviderData(state, keyStore, settings) {
    const backend = settings.get('backend');
    let providerData = backend.local.get('provider::data::verified');
    return {
        status: providerData !== null ? 'loaded' : 'failed',
        data: providerData,
    };
}

// generate and return the (local) provider data
export async function providerData(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    let providerData = backend.local.get('provider::data');
    if (providerData === null) {
        providerData = {
            id: randomBytes(32),
            verifiedID: randomBytes(32),
            data: {},
        };
    }
    if (data !== undefined) providerData.data = data;
    backend.local.set('provider::data', providerData);
    return {
        status: 'loaded',
        data: providerData,
    };
}

// make sure the keys are registered in the backend
export async function validKeyPairs(state, keyStore, settings, keyPairs, keys) {
    const signingKeyHash = await e(hash(keyPairs.signing.publicKey));
    const encryptionKeyHash = await e(hash(keyPairs.encryption.publicKey));
    let found = false;
    console.log('Checking key pairs...');
    console.log(keys);
    console.log(keyPairs);
    for (const providerKeys of keys.lists.providers) {
        if (
            providerKeys.json.signing == signingKeyHash &&
            providerKeys.json.encryption == encryptionKeyHash
        ) {
            console.log('found em!');
            found = true;
            break;
        }
    }
    return { valid: found };
}

// to do: add keyPair to queue request (as the request needs to be signed)
export async function queues(state, keyStore, settings, queueIDs) {
    const backend = settings.get('backend');
    markAsLoading(state, keyStore);
    try {
        const queues = await e(backend.appointments.getQueues(queueIDs));
        return { status: 'loaded', data: queues };
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}

export async function checkVerifiedProviderData(
    state,
    keyStore,
    settings,
    data
) {
    const backend = settings.get('backend');
    const verifiedData = await e(backend.appointments.getData(data.verifiedID));
    if (verifiedData === null) return { status: 'not-found' };
    const encryptionKey = backend.local.get('provider::data::encryptionKey');
    try {
        const decryptedJSONData = await e(
            ecdhDecrypt(verifiedData.data, encryptionKey)
        );
        if (decryptedJSONData === null) {
            // can't decrypt
            return { status: 'failed' };
        }
        const decryptedData = JSON.parse(decryptedJSONData);
        decryptedData.signedData.json = JSON.parse(
            decryptedData.signedData.data
        );
        backend.local.set('provider::data::verified', decryptedData);
        return { status: 'loaded', data: decryptedData };
    } catch (e) {
        return { status: 'failed' };
    }
}

// store the provider data for validation in the backend
export async function submitProviderData(
    state,
    keyStore,
    settings,
    data,
    keyPairs,
    keys
) {
    const backend = settings.get('backend');
    const dataToEncrypt = Object.assign({}, data);
    dataToEncrypt.publicKeys = {
        signing: keyPairs.signing.publicKey,
        encryption: keyPairs.encryption.publicKey,
    };

    const providerDataKey = keys.providerData;

    // we convert the data to JSON
    const jsonData = JSON.stringify(dataToEncrypt);
    const [encryptedData, privateKey] = await e(
        ephemeralECDHEncrypt(jsonData, providerDataKey)
    );

    const encryptedJSONData = JSON.stringify(encryptedData);

    // we store the provider data key so we can decrypt the data later
    backend.local.set('provider::data::encryptionKey', privateKey);

    const signedData = await e(
        sign(
            keyPairs.signing.privateKey,
            encryptedJSONData,
            keyPairs.signing.publicKey
        )
    );

    try {
        return await e(
            backend.appointments.storeProviderData(data.id, signedData)
        );
    } catch (e) {
        return { status: 'failed', error: e.toString() };
    }
}
