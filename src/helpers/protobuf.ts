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

import { parse } from "protobufjs";

export const protocol = parse(`syntax = "proto3";

message ContactData {
	string name = 1;
	string phone = 2;
	string email = 3; // optional
	string street = 4; // optional
	string zip_code = 5; // optional
	string city = 6; // optional
	string country = 7; // optional
}

// the contact data encrypted with Kc and the HD public key
message HDEncryptedContactData {
	bytes iv = 1;
	bytes publicKey = 2;
	bytes data = 3;
}

// the contact data encrypted with Kc
message KcEncryptedContactData {
	bytes data = 1;
	bytes ka = 2;
	bytes iv = 3;
}

// Private key data (private & public EC key and IV)
message PrivateKey {
	PrivateECJWK ecPrivateKey = 1;
	bytes ecPublicKey = 2; // the public key associated with this private key
	bytes iv = 3;
}

// Private EC key data
message PrivateECJWK {
	string crv = 1;
	string d = 2;
	bool ext = 3;
	string key_ops = 4; 
	string kty = 5;
	string x = 6;
	string y = 7;
}

// the encrypted secret data
message EncryptedSecretData {
	bytes iv = 1;
	bytes data = 2;
}

// data for the user and the health department
message SecretData {
	bytes hs = 1; // users' H_s parameter used to generate hashes
	bytes id = 2; // users' ID
	bytes kb = 3; // users' K_b parameter to decrypt his/her data
	bytes privateKey = 4; // users' private key (to update / delete user data)
	repeated PrivateKey kis = 5; // users' private K_i keys and IVs, required to decrypt group data
}

// Encrypted trace data (user ID and K_b value)
message TraceData {
	bytes id = 1;
	bytes kb = 2;
}

// Public trace data
message Trace {
	bytes publicKey = 1;
	bytes hash = 2;
	bytes iv = 3;
	bytes data = 4;
}`, {keepCase: true})

export const PrivateECJWK = protocol.root.lookupType("PrivateECJWK");
export const Trace = protocol.root.lookupType("Trace");
export const TraceData = protocol.root.lookupType("TraceData");
export const SecretData = protocol.root.lookupType("SecretData");
export const EncryptedSecretData = protocol.root.lookupType("EncryptedSecretData");
export const ContactData = protocol.root.lookupType("ContactData");
export const KcEncryptedContactData = protocol.root.lookupType("KcEncryptedContactData");
export const HDEncryptedContactData = protocol.root.lookupType("HDEncryptedContactData");
