// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify } from 'helpers/crypto';

async function verifyOffer(offer, providerKey) {
    let found = providerKey.json.signing === offer.publicKey;
    if (!found) throw 'invalid key';
    const result = await verify([offer.publicKey], offer);
    if (!result) throw 'invalid signature';
    return JSON.parse(offer.data);
}

async function verifyProviderData(providerData, mediatorKey) {
    let found = mediatorKey.json.signing === providerData.publicKey;
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

                const {
                    keyChain
                } = item

                // TOOD: Verify those keys against a baked root key.
                keyChain.mediator.json = JSON.parse(keyChain.mediator.data)
                keyChain.provider.json = JSON.parse(keyChain.provider.data)

                try {
                    item.provider.json = await verifyProviderData(
                        item.provider,
                        keyChain.mediator
                    );
                    const verifiedOffers = [];
                    for (const offer of item.offers) {
                        const verifiedOffer = await verifyOffer(offer, keyChain.provider);
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
                    console.error(e)
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
