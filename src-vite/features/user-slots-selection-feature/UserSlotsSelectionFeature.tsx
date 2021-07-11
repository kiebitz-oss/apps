import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { ecdhEncrypt } from 'helpers/crypto';
import useAvailableUserSlots from '@/hooks/useAvailableUserSlots';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';
import useUserSetupGuard from '@/hooks/useUserSetupGuard';
import { ConfirmMultipleUserOfferEntry, confirmMultipleUserOffers } from '@/kiebitz/user/invitation';
import FeatureHeading from '@/components/FeatureHeading';
import UserSlotsSelectionForm from './UserSlotsSelectionForm';

const UserSlotsSelectionFeature: React.FC = () => {
    const [userSecret] = useUserSecret();
    const [userTokenData] = useUserTokenData();

    // We don't want users to use this page that haven't gone through the setup.
    useUserSetupGuard(userSecret, userTokenData);

    // TODO: We don't want users to use this page if they already have a confirmed invitation.
    // TODO: useUserInvitationConfirmedGuard();

    const history = useHistory();

    // `_offers` is only used for offer confirmation.
    const [slotsForInvitations, invitations] = useAvailableUserSlots();

    const providers = slotsForInvitations.map((slotsForInvitation, i) => {
        // The matching invitation for this slot list
        const invitation = invitations[i];
        const { provider } = invitation;
        return { invitation, provider, slots: slotsForInvitation };
    });

    console.log('Available Providers', providers);

    const handleSlotsSubmit = async (slotIds: string[], invitationIndices: number[]) => {
        const dataForProvider = {
            signedToken: userTokenData.signedToken,
            userData: userTokenData.hashData,
            contactData: userTokenData.encryptedContactData,
        };

        const entries: ConfirmMultipleUserOfferEntry[] = await Promise.all(
            slotIds.map<Promise<ConfirmMultipleUserOfferEntry>>(async (slotId, i) => {
                const invitationIndex = invitationIndices[i];
                const invitation = invitations[invitationIndex];

                const offer = invitation.offers.find((offer) => offer.id === slotId);

                const encryptedProviderData = await ecdhEncrypt(
                    JSON.stringify(dataForProvider),
                    userTokenData.keyPair,
                    invitation.publicKey
                );

                return {
                    offer,
                    encryptedProviderData,
                    dataForProvider,
                    invitation,
                };
            })
        );

        if (!entries.length) {
            console.error('Please choose offers.');
            return;
        }

        try {
            await confirmMultipleUserOffers(entries, userTokenData);
            history.push('/user/appointments/status?success=true');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <FeatureHeading
                title="Aktuelle Impfangebote"
                desc="Bitte wähle alle für Dich passenden Termine aus und bestätige anschließend Deine Auswahl."
            />
            <div className="container mx-auto min-h-screen 2xl:w-1/4 lg:w-1/2 2xl:pt-12 py-6">
                {providers.length ? (
                    <UserSlotsSelectionForm providers={providers} onSubmitSlots={handleSlotsSubmit} />
                ) : (
                    <div className="flex justify-center items-center animate-pulse gap-2">
                        <FaSearch className="text-xl" />
                        <span className="text-xl font-semibold">Suche nach passenden Impfangeboten...</span>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserSlotsSelectionFeature;
