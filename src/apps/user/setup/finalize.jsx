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
import {
    setup,
    uploadSettings,
    uploadContactData,
    storeTracingData,
} from './actions';

import t from './translations.yml';
import './finalize.scss';

const PrintView = () => {
    setQrCodesGenerated(true);

    // we display the generated trace data

    generateTraceData.encryptedTraces.forEach((tr, i) => {
        // we encode each trace
        const trace = {
            publicKey: Buffer.from(b642buf(tr.publicKey)),
            hash: Buffer.from(b642buf(tr.hi)),
            iv: Buffer.from(b642buf(tr.iv)),
            data: Buffer.from(b642buf(tr.data)),
        };

        // we encode the trace data as a protobuf object
        const tracePB = Trace.encode(Trace.fromObject(trace)).finish();

        // we add a small checksum
        const checksum = adler32(tracePB);
        const tracePBWithChecksum = append2buf(tracePB, checksum);

        const base64Data = buf2b64(tracePBWithChecksum);

        QRCode.toCanvas(
            refs[i].current,
            `https://s.kiebitz.eu/#${base64Data}`,
            function(error) {
                if (error) console.error(error);
            }
        );
    });

    const [qrCodesGenerated, setQrCodesGenerated] = useState(false);

    const refs = [];
    const canvases = [];

    for (let i = 0; i < 20; i++) {
        const ref = useRef(null);
        refs.push(ref);
        canvases.push(<canvas className="kip-qr-code" key={i} ref={ref} />);
    }

    return (
        <React.Fragment>
            <div className="kip-qr-codes">{canvases}</div>
        </React.Fragment>
    );
};

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Finalize = withSettings(
    withActions(
        ({
            settings,
            setup,
            uploadContactData,
            uploadContactDataAction,
            storeTracingData,
            storeTracingDataAction,
            uploadSettings,
            uploadSettingsAction,
            route,
        }) => {
            const [uploadTriggered, setUploadTriggered] = useState(false);

            useEffect(() => {
                if (uploadTriggered) return;

                setUploadTriggered(true);

                uploadContactDataAction(setup.uid, setup.encryptedContactData);
                storeTracingDataAction(setup.encryptedTraces);
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
                                <li>
                                    test{' '}
                                    {storeTracingData &&
                                        storeTracingData.status}
                                </li>
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
        },
        [setup, uploadContactData, uploadSettings, storeTracingData]
    )
);

export default Finalize;
