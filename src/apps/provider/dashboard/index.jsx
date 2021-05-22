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

import React, { useEffect, useState, Fragment as F } from "react";

import Settings from "./settings"

import { withSettings, withActions, Tabs, Tab, T, A, Message } from "components";
import { randomBytes, verify, sign, generateECDSAKeyPair, generateECDHKeyPair} from "helpers/crypto";
import { e } from "helpers/async";
import t from "./translations.yml";

// make sure the signing and encryption key pairs exist
async function keyPairs(state, keyStore, settings){
	const backend = settings.get("backend")

	const providerKeyPairs = backend.local.get("provider::keyPairs")

	if (providerKeyPairs === null){
		const encryptionKeyPair = await generateECDSAKeyPair()
		const signingKeyPair = await generateECDHKeyPair()
		const keyPairs = {
			signing: signingKeyPair,
			encryption: encryptionKeyPair,
		}
		backend.local.set("provider::keyPairs", keyPairs)
		return keyPairs
	} else {
		return providerKeyPairs
	}
}

// make sure the keys are registered in the backend
async function validKeyPairs(state, keyStore, settings, key){
	return {valid: false}

}

// store the provider data for validation in the backend
async function storeProviderData(state, keyStore, settings, data, keyPairs){
	const backend = settings.get("backend")
	let id = backend.local.get("provider::ID")
	if (id === null){
		id = randomBytes(32)
		backend.local.set("provider::ID", id)
	}
	const signedData = await e(sign(keyPairs.signing.privateKey, data))
	// we add the public key so that the backend can verify it
	signedData.publicKeys = {
		signing: keyPairs.signing.publicKey,
		encryption: keyPairs.encryption.publicKey
	}
	return await e(backend.appointments.storeProviderData(id, signedData))
}

const Dashboard = withActions(withSettings(({
	route : {handler: {props: {tab}}},
	settings,
	storeProviderData,
	storeProviderDataAction,
	keyPairs,
	keyPairsAction,
	validKeyPairs,
	validKeyPairsAction}) => {

	const [key, setKey] = useState(false)
	const [validKey, setValidKey] = useState(false)
	const [dataStored, setDataStored] = useState(false)

	useEffect(() => {
		if (!key){
			setKey(true)
			keyPairsAction()
		}
		if (!validKey && keyPairs !== undefined){
			setValidKey(true)
			validKeyPairsAction(keyPairs)
		}
		if (!dataStored && keyPairs !== undefined){
			setDataStored(true)

			// we store...
			const providerData = {
				// basic information about the provider
				info: {
					name: "Muster AG",
				},
			}

			storeProviderDataAction(providerData, keyPairs)
		}
	})

	let content

	switch(tab){
		case "settings":
		content = <Settings />
	}

	let invalidKeyMessage

	if (validKeyPairs !== undefined && validKeyPairs.valid === false){
		invalidKeyMessage = <Message type="danger"><T t={t} k="invalidKey" /></Message>
	}

	return <F>
	    <Tabs>
	    	<Tab active={tab === "appointments"} href="/provider/appointments"><T t={t} k="appointments.title"/></Tab>
	    	<Tab active={tab === "settings"} href="/provider/settings"><T t={t} k="settings.title"/></Tab>
	    </Tabs>
	    {invalidKeyMessage}
	    {content}
	</F>
}), [keyPairs, validKeyPairs, storeProviderData])

export default Dashboard;
