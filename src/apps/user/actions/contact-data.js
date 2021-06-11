// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.
import { getUserContactData, setUserContactData } from '../../../../kiebitz/user/contact-data';

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
