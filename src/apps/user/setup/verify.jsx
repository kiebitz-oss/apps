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
import { append2buf, adler32, b642buf, buf2b64 } from 'helpers/conversion';
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
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { ks, setup, hdPublicKey, contactData } from './actions';

import t from './translations.yml';
import './verify.scss';

/*
Here the user has a chance to review all data that was entered before confirming
the setup. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Verify = withSettings(
    withActions(
        ({
            settings,
            contactData,
            contactDataAction,
            hdPublicKey,
            hdPublicKeyAction,
            setup,
            type,
            setupAction,
            ks,
            ksAction,
        }) => {
            useEffect(() => {
                if (contactData === undefined) {
                    contactDataAction({ name: 'Hans Meier' });
                    return;
                }

                if (hdPublicKey === undefined) {
                    hdPublicKeyAction();
                    return;
                }

                // we generate H_s and H_is
                if (ks === undefined) {
                    ksAction();
                    return;
                }

                if (setup === undefined)
                    setupAction(ks, hdPublicKey, contactData);
                else console.log(setup);
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
                                        <T t={t} k="contact-data.phone" />
                                    </span>{' '}
                                    {contactData.phone || (
                                        <T t={t} k="contact-data.not-given" />
                                    )}
                                </li>
                                <li>
                                    <span>
                                        <T t={t} k="contact-data.email" />
                                    </span>{' '}
                                    {contactData.email || (
                                        <T t={t} k="contact-data.not-given" />
                                    )}
                                </li>
                                <li>
                                    <span>
                                        <T t={t} k="contact-data.street" />
                                    </span>{' '}
                                    {contactData.street || (
                                        <T t={t} k="contact-data.not-given" />
                                    )}
                                </li>
                                <li>
                                    <span>
                                        <T t={t} k="contact-data.zip-code" />
                                    </span>{' '}
                                    {contactData.zip_code || (
                                        <T t={t} k="contact-data.not-given" />
                                    )}
                                </li>
                                <li>
                                    <span>
                                        <T t={t} k="contact-data.city" />
                                    </span>{' '}
                                    {contactData.city || (
                                        <T t={t} k="contact-data.not-given" />
                                    )}
                                </li>
                            </ul>
                        </div>
                        <div className="kip-contact-data-links">
                            <A className="bulma-button bulma-is-small">
                                <T t={t} k="contact-data.change" />
                            </A>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="success"
                            href={`/setup/${type}/store-secrets`}
                        >
                            <T t={t} k="wizard.continue" />
                        </Button>
                    </CardFooter>
                </React.Fragment>
            );
        },
        [setup, ks, hdPublicKey, contactData]
    )
);

export default Verify;
