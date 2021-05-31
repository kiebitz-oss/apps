// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from 'helpers/crypto';

// checks invitations
export async function checkInvitations(
    state,
    keyStore,
    settings,
    keyPairs,
    invitations
) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();

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
                            await ecdhDecrypt(
                                result,
                                openToken.keyPair.privateKey
                            )
                        );
                        if (decryptedData === null) continue; // not the right token....

                        const signedData = JSON.parse(
                            decryptedData.signedToken.data
                        );

                        if (
                            acceptedInvitations.find(
                                ai => ai.token.token === signedData.token
                            )
                        )
                            continue; // we already have this token

                        // this token belongs to the given invitation
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
                oa =>
                    !acceptedInvitations.find(ai => ai.invitation.id === oa.id)
            );
            backend.local.set('provider::appointments::open', openAppointments);

            console.log(openTokens);
            console.log(acceptedInvitations);

            // we remove the tokens corresponding to the accepted invitations from
            // the list of open tokens...
            openTokens = openTokens.filter(
                ot =>
                    !acceptedInvitations.find(ai => ai.token.token === ot.token)
            );

            console.log(openTokens);

            backend.local.set('provider::tokens::open', openTokens);

            return {
                status: 'loaded',
                data: acceptedInvitations,
            };
        } catch (e) {
            console.log(e.toString());
        }
    } finally {
        backend.local.unlock();
    }
}
