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

// salt for the key derivation (public information)
const salt = b642buf("352b73ebd067e1c17996ee2180dbd8a339de2ed97c3604a346ca07917a71091193003f56465a097c98aa572373969057")

export async function deriveToken(key, secret, n){
	const keyBytes = b642buf(key)
	const secretBytes = b642buf(secret)

	const fullKeyBytes = new Int8Array(keyBytes.length + secretBytes.length);
	fullKeyBytes.set(keyBytes);
	fullKeyBytes.set(secretBytes, keyBytes.length);
    
    const secretKey = await e(crypto.subtle.importKey('raw', fullKeyBytes, 'HKDF', false, ['deriveBits']))

    const token = await e(crypto.subtle.deriveBits(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: salt, // this is public information
            info: str2ab(`${n}`),
        }, secretKey, 256))

    return buf2b64(token)
}
