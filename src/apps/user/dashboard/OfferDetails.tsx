import React from 'react';
import { Trans } from '@lingui/macro';
import { useSettings } from 'hooks';
import type { Offer } from 'types';
import { Link } from 'ui';

interface OfferDetailsProps {
    offer: Offer;
}

export const OfferDetails: React.FC<OfferDetailsProps> = ({ offer }) => {
    const settings = useSettings();
    const lang = settings.get('lang');
    const notices: any[] = [];
    const properties = settings.get('appointmentProperties');

    Object.entries(properties).forEach(([category, values]: any[]) => {
        Object.entries(values.values).forEach(([k, v]: any[]) => {
            if (
                (offer[k] === true ||
                    (offer.properties !== undefined &&
                        offer.properties[category] === k)) &&
                v.notice !== undefined &&
                v.infosUrl !== undefined &&
                v.anamnesisUrl !== undefined
            )
                notices.push(
                    <React.Fragment key="k">
                        <p>{v.notice[lang]}</p>

                        <p>
                            <Trans id="offer-notice-text">
                                Bitte füllen Sie nach Möglichkeit{' '}
                                <Link href={v.anamnesisUrl[lang]} external>
                                    die Anamnese- und Einwilligungserklärung
                                </Link>{' '}
                                sowie{' '}
                                <Link href={v.infosUrl[lang]} external>
                                    das Aufklärungsmerkblatt
                                </Link>{' '}
                                für den Impfstoff <strong>{v[lang]}</strong> aus
                                und bringen Sie diese unterschrieben mit zur
                                Impfung (falls Sie keine Möglichkeit haben die
                                Dokumente zu drucken können Sie diese auch vor
                                Ort ausfüllen).
                            </Trans>
                        </p>
                    </React.Fragment>
                );
        });
    });

    return <div className="kip-offer-details">{notices}</div>;
};
