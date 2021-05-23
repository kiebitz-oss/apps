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

import t from './translations.yml';
import './finalize.scss';

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Finalize = withSettings(
    withActions(({ settings, route }) => {
        const [uploadTriggered, setUploadTriggered] = useState(false);

        useEffect(() => {
            if (uploadTriggered) return;

            setUploadTriggered(true);
        });

        return (
            <React.Fragment>
                <CardContent>
                    <p className="kip-finalize-notice">
                        <T
                            t={t}
                            k="finalize.text"
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
                    <div className="kip-finalize-box">
                        <ul>
                            <li>test</li>
                        </ul>
                    </div>
                    <div className="kip-finalize-links">
                        <A className="bulma-button bulma-is-small">
                            <T t={t} k="contact-data.change" />
                        </A>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="success">
                        <T t={t} k="wizard.leave" />
                    </Button>
                </CardFooter>
            </React.Fragment>
        );
    }, [])
);

export default Finalize;
