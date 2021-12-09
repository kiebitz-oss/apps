import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { withActions } from 'components';
import {
    Button,
    Message,
    BoxContent,
    BoxFooter,
    Box,
    BoxHeader,
    Link,
    Title,
} from 'ui';
import {
    userSecret,
    acceptedInvitation,
    invitation,
    tokenData,
} from 'apps/user/actions';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { OfferDetails } from './OfferDetails';
import { ProviderDetails } from './ProviderDetails';

const AcceptedInvitationBase: React.FC<any> = ({
    acceptedInvitation,
    offers,
    userSecret,
}) => {
    const [showDelete, setShowDelete] = useState(false);

    const { offer, invitation: invitationData } = acceptedInvitation.data;

    const currentOffer = offers.find((of: any) => of.id == offer.id);

    let changed = false;

    for (const [k, v] of Object.entries(currentOffer)) {
        if (['open', 'slotData', 'properties', 'slots'].includes(k)) {
            continue;
        }

        if (offer[k] !== v) {
            changed = true;
            break;
        }
    }

    const d = new Date(currentOffer.timestamp);

    if (showDelete) {
        return <CancelAppointmentModal onClose={() => setShowDelete(false)} />;
    }

    return (
        <Box>
            <BoxHeader className="flex justify-between">
                <Title>
                    <Trans id="invitation-accepted.title">
                        Termin bestätigt!
                    </Trans>
                </Title>

                <Link href="/user/log-out">
                    <Trans id="log-out">Abmelden</Trans>
                </Link>
            </BoxHeader>

            <BoxContent>
                {changed && (
                    <Message variant="danger">
                        <Trans id="invitation-accepted.changed">
                            Details Deines Termins haben sich geändert!
                        </Trans>
                    </Message>
                )}

                <ProviderDetails provider={invitationData.provider.json} />

                <OfferDetails offer={currentOffer} />

                <p className="p-6 text-3xl font-semibold text-center">
                    {d.toLocaleDateString()} · <u>{d.toLocaleTimeString()}</u>
                </p>

                <div className="p-3 text-center bg-green-100 rounded-md">
                    <Trans id="invitation-accepted.booking-code">
                        Buchungscode zur Vorlage: Bitte notieren!
                    </Trans>

                    <div className="text-2xl font-bold uppercase">
                        {userSecret.data.slice(0, 4)}
                    </div>
                </div>
            </BoxContent>

            <BoxFooter>
                <Button variant="warning" onClick={() => setShowDelete(true)}>
                    <Trans id="cancel-appointment">Termin absagen</Trans>
                </Button>
            </BoxFooter>
        </Box>
    );
};

export const AcceptedInvitation = withActions(AcceptedInvitationBase, [
    userSecret,
    acceptedInvitation,
    invitation,
    tokenData,
]);
