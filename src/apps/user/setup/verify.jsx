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

import React, { useEffect, useRef, useState } from 'react';
import {
    withSettings,
    withActions,
    Modal,
    CardContent,
    CardFooter,
    Button,
    T,
    A,
} from 'components';
import Wizard from './wizard';
import { contactData } from './actions';

import t from './translations.yml';
import './verify.scss';

/*
Here the user has a chance to review all data that was entered before confirming
the setup. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Verify = withSettings(
    withActions(
        ({ settings, contactData, contactDataAction }) => {
            const [initialized, setInitialized] = useState(false);

            useEffect(() => {
                if (initialized) return;
                contactDataAction();
                setInitialized(true);
            });

            if (contactData === undefined) return <div />;
            return (
                <React.Fragment>
                    <CardContent>
                        <p className="kip-verify-notice">
                            <T
                                t={t}
                                k="verify.text"
                                link={
                                    <A
                                        key="letUsKnow"
                                        external
                                        href={settings.get('supportEmail')}
                                    >
                                        <T
                                            t={t}
                                            k="wizard.letUsKnow"
                                            key="letUsKnow"
                                        />
                                    </A>
                                }
                            />
                        </p>
                        <div className="kip-contact-data-box">
                            <ul>
                                <li>
                                    <span>
                                        <T t={t} k="contact-data.name" />
                                    </span>{' '}
                                    {contactData.name}
                                </li>
                                <li>
                                    <span>
                                        <T t={t} k="contact-data.email" />
                                    </span>{' '}
                                    {contactData.email || (
                                        <T t={t} k="contact-data.not-given" />
                                    )}
                                </li>
                            </ul>
                        </div>
                        <div className="kip-contact-data-links">
                            <A
                                className="bulma-button bulma-is-small"
                                href="/user/setup/enter-contact-data"
                            >
                                <T t={t} k="contact-data.change" />
                            </A>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="success" href={`/user/setup/finalize`}>
                            <T t={t} k="wizard.continue" />
                        </Button>
                    </CardFooter>
                </React.Fragment>
            );
        },
        [contactData]
    )
);

export default Verify;
