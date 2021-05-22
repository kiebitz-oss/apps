// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { ActionStates } from "actions/base";

export async function uploadContactData(state, keyStore, settings, id, data){

	console.log(state)

	if (state !== undefined)
		return

	const backend = settings.get(["backend"])
	const promise = backend.tracing.storeContactData(id, data)

	promise.then((data) => keyStore.set({status: ActionStates.succeeded}))
	promise.catch((error) => keyStore.set({status: ActionStates.failed}))

	// we set an intermediate state
	keyStore.set({
		status: ActionStates.creating,
	})

	return promise
}
