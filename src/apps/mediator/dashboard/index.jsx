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
import Providers from "./providers"

import { withSettings, withActions, Tabs, Tab, T, A, Message } from "components";
import { verify, sign, generateECDSAKeyPair, generateECDHKeyPair } from "helpers/crypto";
import { e } from "helpers/async";
import t from "./translations.yml";

// make sure the signing and encryption key pairs exist
async function keyPairs(state, keyStore, settings){
	const backend = settings.get("backend")

	let providerKeyPairs = backend.local.get("mediator::keyPairs")

	if (providerKeyPairs === null){
		const encryptionKeyPair = await generateECDSAKeyPair()
		const signingKeyPair = await generateECDHKeyPair()
		let providerKeyPairs = {
			signing: signingKeyPair,
			encryption: encryptionKeyPair,
		}
		backend.local.set("mediator::keyPairs", providerKeyPairs)
	}

	// in the test environment we automatically add the mediator keys to
	// the public key list and sign them with the root key so that they're
	// accepted as valid keys...
	if (settings.get("test")){
		await e(backend.appointments.addMediatorPublicKeys(providerKeyPairs))
	}

	return providerKeyPairs

}

// make sure the keys are registered in the backend
async function validKeyPairs(state, keyStore, settings, key){
	return {valid: true}

}

const Dashboard = withActions(withSettings((
	{route : {handler: {props: {tab, action, id}}},
	settings,
	keyPairs,
	keyPairsAction,
	validKeyPairs,
	validKeyPairsAction}) => {

	const [key, setKey] = useState(false)
	const [validKey, setValidKey] = useState(false)

	useEffect(() => {
		if (!key){
			setKey(true)
			keyPairsAction()
		}
		if (!validKey && keyPairs !== undefined){
			setValidKey(true)
			validKeyPairsAction(keyPairs)
		}
	})

	let content

	if (keyPairs !== undefined){
		switch(tab){
			case "settings":
				content = <Settings keyPairs={keyPairs} />
				break
			case "providers":
				content = <Providers action={action} id={id} keyPairs={keyPairs} />
				break
		}		
	}

	let invalidKeyMessage

	if (validKeyPairs !== undefined && validKeyPairs.valid === false){
		invalidKeyMessage = <Message type="danger"><T t={t} k="invalidKey" /></Message>
	}

	return <F>
	    <Tabs>
	    	<Tab active={tab === "providers"} href="/mediator/providers"><T t={t} k="providers.title"/></Tab>
	    	<Tab active={tab === "queues"} href="/mediator/queues"><T t={t} k="queues.title"/></Tab>
	    	<Tab active={tab === "settings"} href="/mediator/settings"><T t={t} k="settings.title"/></Tab>
	    </Tabs>
	    {invalidKeyMessage}
	    {content}
	</F>
}), [keyPairs, validKeyPairs])

export default Dashboard;
