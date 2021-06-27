// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.
import { getUserContactData, setUserContactData } from '../../../../kiebitz/user/contact-data';

import { randomBytes } from 'helpers/crypto';

export async function contactData(state, keyStore, settings, data) {
    // we just store the data...
    if (data !== undefined) setUserContactData(data);
    data = getUserContactData();
    if (data === null)
        return {
            status: 'failed',
        };
    return {
        status: 'loaded',
        data: data,
    };
}

contactData.actionName = 'contactData';

contactData.init = (keyStore, settings) => {
    const backend = settings.get('backend');
    let data = backend.local.get('user::contactData');
    if (data === null) {
        data = {
            // the grant seed is used to generate grant IDs for this user.
            // It is accessible only by the provider, ensuring that the backend
            // cannot associate a given grant with a specific token (as with
            // version 0.2)
            grantSeed: randomBytes(32),
        };
        backend.local.set('user::contactData', data);
    }
    return {
        status: 'loaded',
        data: data,
    };
};
