// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserDecryptedInvitationData } from '../business-logic/invitation';

export async function checkInvitationData(
    state,
    keyStore,
    settings,
    keys,
    tokenData
) {
    try {
        const decryptedData = await getUserDecryptedInvitationData(
            keys,
            tokenData
        );

        return {
            status: 'loaded',
            data: decryptedData,
        };
    } catch (error) {
        console.error(error);
        return {
            status: 'failed',
            error,
        };
    }
}

checkInvitationData.actionName = 'checkInvitationData';
