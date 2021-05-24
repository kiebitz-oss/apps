// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

const LoggedIn = "LOGGED_IN"

export async function user(state, keyStore, settings, signedData){
	return {
		status: LoggedIn
	}
}
