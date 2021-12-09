import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { withActions } from 'components';
import { formatDuration } from 'helpers/time';
import { useSettings } from 'hooks';

import {
    Button,
    Message,
    BoxContent,
    BoxFooter,
    Box,
    BoxHeader,
    Title,
} from 'ui';
import {
    confirmOffers,
    acceptedInvitation,
    userSecret,
} from 'apps/user/actions';
import { ProviderDetails } from './ProviderDetails';
import { Invitation, Offer, TokenData } from 'types';
import clsx from 'clsx';

const PropertyTags: React.FC<any> = ({ appointment }) => {
    const props = Object.entries(appointment.properties)
        .map(([, v]) => <PropertyTag key={v} property={v} />)
        .filter((p) => p !== undefined);

    return <>{props}</>;
};

const PropertyTag: React.FC<any> = ({ property }) => {
    const settings = useSettings();
    const lang = settings.get('lang');
    const properties = settings.get('appointmentProperties');

    const elements = Object.entries(properties).map(([_, values]: any[]) => {
        const prop = values.values[property];

        if (prop !== undefined) {
            return (
                <span key={property} className={`kip-tag kip-is-${property}`}>
                    {prop[lang]}
                </span>
            );
        }
    });

    return elements;
};

interface InvitationDetailsProps {
    invitation: Invitation;
    tokenData: TokenData;
    [key: string]: any;
}

const InvitationDetailsBase: React.FC<InvitationDetailsProps> = ({
    invitation,
    tokenData,
    acceptedInvitationAction,
    confirmOffersAction,
}) => {
    const [confirming, setConfirming] = useState<boolean>(false);
    const [selected, setSelected] = useState<Offer | null>(null);

    const doConfirmOffers = () => {
        const selectedOffers = [];

        // we add the selected offers in the order the user chose
        const offer = invitation.offers.find(
            (offer) => offer.id === selected?.id
        );

        selectedOffers.push(offer);

        setConfirming(true);

        const p = confirmOffersAction(
            selectedOffers,
            invitation,
            tokenData.data
        );

        p.then(() => {
            acceptedInvitationAction();
        });

        p.finally(() => {
            setConfirming(false);
            setSelected(null);
        });
    };

    // to do: use something better than the index i for the key?
    const offers = invitation.offers
        // show only offers with available slots
        .filter((offer) => offer.slotData.some((sl) => sl.open))
        // show only offers which are in the future
        .filter((a) => new Date(a.timestamp) > new Date())
        // sort by date
        .sort(
            (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
        );

    return (
        <Box>
            <BoxHeader className="flex justify-between">
                <Title>
                    <Trans id="user-data.appointments.title">
                        Terminübersicht {invitation.provider.json.name}
                    </Trans>
                </Title>
            </BoxHeader>
            <BoxContent>
                <ProviderDetails provider={invitation.provider.json} />

                {offers.length === 0 && (
                    <Message variant="warning">
                        <Trans id="no-offers-anymore">
                            Alle Terminangebote sind bereits abgelaufen. Bitte
                            hab' etwas Geduld, du wirst voraussichtlich neue
                            Angebote erhalten.
                        </Trans>
                    </Message>
                )}

                {offers.length > 0 && (
                    <table className="table striped invitation-details">
                        <thead>
                            <tr>
                                <th>&nbsp;</th>

                                <th>
                                    <Trans id="appointment-date">Datum</Trans>
                                </th>
                                <th>
                                    <Trans id="appointment-duration">
                                        Dauer
                                    </Trans>
                                </th>
                                <th>
                                    <Trans id="appointment-vaccine">
                                        Impfstoff
                                    </Trans>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {offers.map((offer: any) => {
                                const d = new Date(offer.timestamp);
                                const isSelected = selected?.id === offer.id;

                                return (
                                    <tr
                                        key={offer.id}
                                        className={clsx({
                                            ['selected']: isSelected,
                                        })}
                                        onClick={() =>
                                            isSelected
                                                ? setSelected(null)
                                                : setSelected(offer)
                                        }
                                    >
                                        <td>
                                            <input
                                                className="checkbox"
                                                type="checkbox"
                                                name="offers[]"
                                                value={offer.id}
                                                checked={isSelected}
                                                onChange={() =>
                                                    isSelected
                                                        ? setSelected(null)
                                                        : setSelected(offer)
                                                }
                                            />
                                        </td>
                                        <td>
                                            {d.toLocaleString('de-DE', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td>
                                            {formatDuration(offer.duration)}
                                        </td>
                                        <td>
                                            <PropertyTags appointment={offer} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </BoxContent>

            <BoxFooter>
                <Button
                    onClick={doConfirmOffers}
                    waiting={confirming}
                    disabled={confirming || !selected}
                    variant="success"
                >
                    <Trans id="confirm-appointment">
                        Terminauswahl bestätigen
                    </Trans>
                </Button>
            </BoxFooter>
        </Box>
    );
};

export const InvitationDetails = withActions(InvitationDetailsBase, [
    confirmOffers,
    acceptedInvitation,
    userSecret,
]);
