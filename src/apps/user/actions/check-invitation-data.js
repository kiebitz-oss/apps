// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserDecryptedInvitationData } from '../../../../kiebitz/user/invitation';

export async function checkInvitationData(state, keyStore, settings, keys, tokenData) {
    try {
        // TODO: If locking fails, throw null error.
        const decryptedDataList = await getUserDecryptedInvitationData(keys, tokenData);

        return {
            status: 'loaded',
            data: decryptedDataList,
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
