import React from 'react';
import { Trans } from '@lingui/macro';
import clsx from 'clsx';
import { Message } from 'ui';

interface ProviderDataProps {
    providerData: any;
    changeHref?: string;
    verified?: boolean;
}

export const ProviderDataSummary: React.FC<ProviderDataProps> = ({
    providerData,

    verified = false,
}) => {
    let data;

    if (verified) {
        if (providerData.data === null)
            return (
                <>
                    <p>
                        <Trans id="provider-data.not-verified-yet">
                            Ihre Daten wurden noch nicht verifiziert. Bitte
                            haben Sie Verständnis, dass die Verifizierung bis zu
                            48h dauern kann.
                        </Trans>
                    </p>
                </>
            );
        data = providerData.data.signedData.json;
    } else data = providerData.data.data;

    return (
        <>
            <Message
                variant="warning"
                className="py-3 my-6 text-xl font-semibold text-center"
            >
                <Trans id="verify.text">
                    Bitte überprüfen Sie Ihre Daten, bevor Sie den Vorgang
                    abschließen.
                </Trans>
            </Message>

            <div
                className={clsx('provider-data-summary', {
                    ['verified']: verified,
                })}
            >
                <dl>
                    <dt>
                        <Trans id="provider-data.name">
                            Vollständiger Name
                        </Trans>
                    </dt>
                    <dd>{data.name}</dd>

                    <dt>
                        <Trans id="provider-data.street">
                            Straße & Hausnummer
                        </Trans>
                    </dt>
                    <dd>{data.street}</dd>

                    <dt>
                        <Trans id="provider-data.zip-code">Postleitzahl</Trans>{' '}
                        &<Trans id="provider-data.city">Ort</Trans>
                    </dt>
                    <dd>
                        {data.zipCode} - &nbsp;
                        {data.city}
                    </dd>

                    <dt>
                        <Trans id="provider-data.website">Webseite</Trans>
                    </dt>
                    <dd>{data.website}</dd>

                    <dt>
                        <Trans id="provider-data.description">
                            Informationen für Impfwillige (z.B. wenn Sie
                            spezielle Impfstoffe nur bestimmten Gruppen
                            empfehlen)
                        </Trans>
                    </dt>
                    <dd>
                        {data.description || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
                    </dd>

                    <dt>
                        <Trans id="provider-data.phone">
                            Telefonnummer (nicht sichtbar für Impfinteressierte)
                        </Trans>
                    </dt>
                    <dd>
                        {data.phone || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
                    </dd>

                    <dt>
                        <Trans id="provider-data.email" />
                    </dt>
                    <dd>
                        {data.email || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
                    </dd>

                    <dt>
                        <Trans id="provider-data.access-code.label">
                            Zugangscode (falls vorhanden)
                        </Trans>
                    </dt>
                    <dd>
                        {data.code || (
                            <Trans id="provider-data.not-given">
                                (keine Angabe)
                            </Trans>
                        )}
                    </dd>

                    <dt>
                        <Trans id="provider-data.accessible">
                            Barrierefreier Zugang zur Praxis/zum Impfzentrum
                        </Trans>
                        ?
                    </dt>
                    <dd>
                        {data.accessible ? (
                            <Trans id="yes">Ja</Trans>
                        ) : (
                            <Trans id="no">Nein</Trans>
                        )}
                    </dd>
                </dl>
            </div>
        </>
    );
};
