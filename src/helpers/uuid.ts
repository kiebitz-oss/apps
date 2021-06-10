// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

/**
 * Creates a v4 UUIDs. Variant 4 generates a random UUID without a seed.
 */
export const uuidv4 = (): string => {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => {
        const cNum = Number(c);
        return (cNum ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (cNum / 4)))).toString(16);
    });
};
