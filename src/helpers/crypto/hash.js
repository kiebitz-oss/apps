// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { b642buf, buf2b64, str2ab } from 'helpers/conversion';
import { e } from 'helpers/async';

export async function hash(rawData) {
    const data = b642buf(rawData);
    return buf2b64(await e(crypto.subtle.digest('SHA-256', data)));
}

export async function hashString(rawData) {
    const data = str2ab(rawData);
    return buf2b64(await e(crypto.subtle.digest('SHA-256', data)));
}
