// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { buf2b64 } from 'helpers/conversion';

export function randomBytes(n) {
    const array = new Uint8Array(n);
    window.crypto.getRandomValues(array);
    return buf2b64(array);
}
