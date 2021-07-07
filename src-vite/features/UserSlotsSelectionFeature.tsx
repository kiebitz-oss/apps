import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import ProviderSlots from '@/components/ProviderSlots';
import useAvailableUserSlots, { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';
import useUserSetupGuard from '@/hooks/useUserSetupGuard';
import { confirmUserOffers } from '@/kiebitz/user/invitation';
import { ephemeralECDHEncrypt } from '@/helpers/crypto';
import Card from '@/components/Card';
import FeatureHeading from '@/components/FeatureHeading';

const UserSlotsSelectionFeature: React.FC = () => {
    const [userSecret] = useUserSecret();
    const [userTokenData] = useUserTokenData();

    // We don't want users to use this page that haven't gone through the setup.
    useUserSetupGuard(userSecret, userTokenData);

    // TODO: We don't want users to use this page if they already have a confirmed invitation.
    // TODO: useUserInvitationConfirmedGuard();

    // `_offers` is only used for offer confirmation.
    const [slotsList, invitations] = useAvailableUserSlots();

    const availableProviders = invitations.length
        ? slotsList.map((slots, i) => ({ provider: invitations[i]?.provider, slots }))
        : [];

    const history = useHistory();

    // TODO: This needs to be able to handle multiple providers in the future.
    // TODO: It currently just assumes we're using the first list item.
    const handleSlotsSubmit = async (slotIds: string[]) => {
        const providerData = {
            signedToken: userTokenData.signedToken,
            userData: userTokenData.hashData,
        };

        const [encryptedProviderData] = await ephemeralECDHEncrypt(
            JSON.stringify(providerData),
            invitations[0].publicKey
        );

        const offers = (invitations[0]?.offers ?? []).filter((offer) => !!slotIds.find((id) => id === offer.id));

        if (!offers.length) {
            console.error('Please choose offers.');
            return;
        }

        await confirmUserOffers(offers, encryptedProviderData, invitations[0], userTokenData);
        history.push('/user/appointments/status?success=true');
    };

    const renderAvailableProvider = (data: { provider: any; slots: SlotsByDay[] }, i): React.ReactNode => {
        // TODO: We currently deliberately only show one provider. Change this!
        if (!data.provider || i !== 0) {
            return null;
        }

        const { provider, slots } = data;
        const { signature, json } = provider;
        const { name, street, zipCode, city, accessible, description, website } = json;

        return (
            <ProviderSlots
                key={signature}
                name={name}
                street={street}
                zip={zipCode}
                city={city}
                desc={description}
                website={website}
                isAccessible={accessible}
                slots={slots}
                onSlotsSubmit={handleSlotsSubmit}
            />
        );
    };

    return (
        <>
            <FeatureHeading
                title="Aktuelle Impfangebote"
                desc="Bitte wähle alle für Dich passenden Termine aus und bestätige anschließend Deine Auswahl."
            />
            <div className="container mx-auto min-h-screen 2xl:w-1/4 lg:w-1/2 2xl:pt-12 py-6">
                <Card className="lg:rounded-lg">
                    {availableProviders.length ? (
                        <div>{availableProviders.map(renderAvailableProvider)}</div>
                    ) : (
                        <div className="flex justify-center items-center animate-pulse gap-2">
                            <FaSearch className="text-xl" />
                            <span className="text-xl font-semibold">Suche nach passenden Impfangeboten...</span>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
};

export default UserSlotsSelectionFeature;
