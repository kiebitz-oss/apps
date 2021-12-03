// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

const LoggedIn = 'LOGGED_IN';

export async function user(
    _state: any,
    _keyStore: any,
    _settings: any,
    _signedData: any
) {
    return {
        status: LoggedIn,
    };
}

user.actionName = 'user';
