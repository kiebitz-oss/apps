// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify } from 'helpers/crypto';

async function verifyOffer(offer, keys) {
    let found = false;
    for (const providerKeys of keys.lists.providers) {
        if (providerKeys.json.signing === offer.publicKey) {
            found = true;
            break;
        }
    }
    if (!found) throw 'invalid key';
    const result = await verify([offer.publicKey], offer);
    if (!result) throw 'invalid signature';
    return JSON.parse(offer.data);
}

async function verifyProviderData(providerData, keys) {
    let found = false;
    for (const mediatorKeys of keys.lists.mediators) {
        if (mediatorKeys.json.signing === providerData.publicKey) {
            found = true;
            break;
        }
    }
    if (!found) throw 'invalid key';
    const result = await verify([providerData.publicKey], providerData);
    if (!result) throw 'invalid signature';
    return JSON.parse(providerData.data);
}

export async function getAppointments(
    state,
    keyStore,
    settings,
    queueData,
    keys
) {
    const backend = settings.get('backend');

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock('getAppointments');
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        keyStore.set({ status: 'submitting' });
        const tokenData = backend.local.get('user::tokenData');

        if (tokenData === null) {
            return {
                status: 'failed',
            };
        }

        try {
            // we already have a token, we just renew it
            const result = await backend.appointments.getAppointmentsByZipCode({
                zipCode: queueData.zipCode,
            });

            const verifiedAppointments = [];

            for (const item of result) {
                try {
                    item.provider.json = await verifyProviderData(
                        item.provider,
                        keys
                    );
                    const verifiedOffers = [];
                    for (const offer of item.offers) {
                        const verifiedOffer = await verifyOffer(offer, keys);
                        for (const slot of verifiedOffer.slotData) {
                            if (item.booked.some(id => id === slot.id))
                                slot.open = false;
                            else slot.open = true;
                        }
                        verifiedOffers.push(verifiedOffer);
                    }
                    item.offers = verifiedOffers;
                    verifiedAppointments.push(item);
                } catch (e) {
                    continue;
                }
            }

            verifiedAppointments.sort((a, b) =>
                a.provider.json.name > b.provider.json.name ? 1 : -1
            );

            backend.local.set(
                'user::appointments::verified',
                verifiedAppointments
            );

            backend.local.set('user::invitation::slots', {});

            return {
                data: verifiedAppointments,
                status: 'suceeded',
            };
        } catch (e) {
            return {
                status: 'failed',
                error: e,
            };
        }
    } finally {
        backend.local.unlock('getAppointments');
    }
}

getAppointments.reset = () => ({ status: 'initialized' });

getAppointments.actionName = 'getAppointments';
