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

import Base from "actions/base";
import { buf2b64, str2ab, buf2base32 } from "helpers/conversion";

// For N=8 we have 2^64 = 2e19 possible passwords. In combination with a strong enough
// key derivation algorithm this should be sufficient to protect the user data.
const N = 8;

function g(n){
    while(true){
        try{
            return buf2base32(window.crypto.getRandomValues(new Uint8Array(n)))
        } catch (e){
            // for values of 8*N that are not divisible by 5 the encoding might produce values
            // with leading zeros that do not decode properly without knowledge of N. As we might
            // change N we make sure that we do not pick such a value (buf2base32 will check it
            // and throw an error if the decoding does not produce the same bit array)
            // This should happen only very rarely...
        }
    }
}

export async function ks(state, keyStore, settings){
    try {
        const kabBytes = new Uint8Array(64)
        crypto.getRandomValues(kabBytes)

        // we generate the base key
        const kcBase = await crypto.subtle.importKey('raw', kabBytes, 'HKDF', false, ['deriveKey']).catch(e => {throw e})

        // the UID for storing the user data in the backend
        const uid = window.crypto.getRandomValues(new Uint8Array(16));

        const kc = await crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: str2ab('0v7vJAwqAbFAeK7VwfMRV9so5kZlK6QF62q6b4fG'), // this is public information
                info: str2ab(`1`), // we use a number string here for simplicity
            }, kcBase, {
                name: 'AES-GCM',
                length: 256,
            }, true, ['encrypt', 'decrypt']).catch(e => {throw e})

        const kcBytes = await crypto.subtle.exportKey('raw', kc).catch(e => {throw e})

        return {uid: buf2b64(uid), ka: buf2b64(kabBytes.slice(0,32)), kb: buf2b64(kabBytes.slice(32,64)), kc: buf2b64(kcBytes), suid: g(N), spwd: g(N)}

    } catch (e) {
        return {error: e.toString()}
    }
}
