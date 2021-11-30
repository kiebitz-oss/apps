// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import {
    withActions,
    Modal,
    CardContent,
    WithLoader,
    CardFooter,
    Button,
    T,
    A,
} from 'components';
import Wizard from './wizard';
import { contactData } from 'apps/user/actions';

import { Trans } from '@lingui/macro';
import './verify.scss';
import { useSettings } from 'hooks';

/*
Here the user has a chance to review all data that was entered before confirming
the setup. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const VerifyPage = ({ contactData, contactDataAction }) => {
    const [initialized, setInitialized] = useState(false);
    const settings = useSettings();

    useEffect(() => {
        if (initialized) return;
        contactDataAction();
        setInitialized(true);
    });

    const render = () => (
        <React.Fragment>
            <CardContent>
                <p className="kip-verify-notice">
                    <Trans id="verify.text">Bitte überprüfe Deine Daten.</Trans>
                </p>
                <div className="kip-contact-data-box">
                    <ul>
                        <li>
                            <span>
                                <Trans id="contact-data.email.label">
                                    E-Mail Adresse
                                </Trans>
                            </span>{' '}
                            {contactData.data.email || (
                                <Trans id="contact-data.not-given">
                                    (keine Angabe)
                                </Trans>
                            )}
                        </li>
                    </ul>
                </div>
                <div className="kip-contact-data-links">
                    <A
                        className="bulma-button bulma-is-small"
                        href="/user/setup/enter-contact-data"
                    >
                        <Trans id="contact-data.change">Anpassen</Trans>
                    </A>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="success" href={`/user/setup/finalize`}>
                    <Trans id="wizard.continue">Weiter</Trans>
                </Button>
            </CardFooter>
        </React.Fragment>
    );

    return <WithLoader resources={[contactData]} renderLoaded={render} />;
};

export default withActions(VerifyPage, [contactData]);
