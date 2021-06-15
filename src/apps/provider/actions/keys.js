// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { markAsLoading } from 'helpers/actions';
import { getKeys } from '../../../../kiebitz/user/keys';

export async function keys(state, keyStore, settings) {
    try {
        markAsLoading(state, keyStore);
        const keys = await getKeys();

        return {
            status: 'loaded',
            data: keys,
        };
    } catch (e) {
        return { status: 'failed', error: e };
    }
}

keys.actionName = 'keys';
