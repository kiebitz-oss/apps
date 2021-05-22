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

import { b642buf, buf2b64, str2ab } from "helpers/conversion";
import { e } from "helpers/async";

export async function sign(keyData, rawData){

	const data = str2ab(rawData)
	const ab = b642buf(keyData)

	try {
		// we import the key data
		const key = await e(crypto.subtle.importKey("pkcs8", ab, {name: "ECDSA", namedCurve: "P-256"}, false, ["sign"]))
		const result = await e(crypto.subtle.sign({name: "ECDSA", hash: "SHA-256"}, key, data))
		return {signature: buf2b64(result), data: rawData}
	} catch(e) {
		console.log(e)
	}
    return null
}
