// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export function parseQuery(qstr: string) {
    return Object.fromEntries(new URLSearchParams(qstr));
}

export function encodeQueryData(data: { [key: string]: string }) {
    return Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}
