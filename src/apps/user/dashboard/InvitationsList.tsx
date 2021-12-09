import { Trans } from '@lingui/macro';
import React from 'react';
import { Invitation, TokenData } from 'types';
import { Title } from 'ui';
import { invitation } from '../actions';
import { InvitationDetails } from './InvitationDetails';
import { NoInvitations } from './NoInvitations';

const filterInvitations = (invitation: Invitation) => {
    return invitation.offers !== null;
};

interface InvitationsListProps {
    invitations: any[];
    tokenData: TokenData;
}

export const InvitationsList: React.FC<InvitationsListProps> = ({
    invitations,
    tokenData,
}) => {
    if (!invitations) {
        return null;
    }

    // we only show relevant invitations
    invitations = invitations.filter((inv) => filterInvitations(inv));

    console.log(
        invitations.filter((invitation) => invitation.offers.length > 0)
    );

    if (invitations.length === 0) {
        return <NoInvitations tokenData={tokenData} />;
    }

    return (
        <>
            <div className="p-8 mx-auto w-2/3">
                <Title className="mb-8 text-base font-semibold tracking-wide text-center text-primary-600 uppercase">
                    Fast geschafft!
                    <p className="mt-1 text-4xl font-extrabold text-gray-900 normal-case sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Impfterminauswahl
                    </p>
                </Title>

                <p>
                    <Trans id="appointments-notice">
                        Bitte wähle alle für Dich passenden Termine aus und
                        bestätige anschließend Deine Auswahl. Beachte bitte,
                        dass du pünktlich zum Termin erscheinst. Die angegebene
                        Dauer entspricht dem maximal zu erwartenden Zeitbedarf.
                    </Trans>
                </p>
            </div>

            <div className="flex flex-col gap-8 mx-auto">
                {invitations.map((invitation) => (
                    <InvitationDetails
                        tokenData={tokenData}
                        invitation={invitation}
                        key={invitation.provider.signature}
                    />
                ))}
            </div>
        </>
    );
};
