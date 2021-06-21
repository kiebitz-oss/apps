import React from 'react';
import { useHistory } from 'react-router-dom';
import ProviderSlotsCard from '@/components/ProviderSlotsCard';
import { HeroTitle } from '@/components/HeroTitle';
import useAvailableUserSlots, { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';
import useUserSetupGuard from '@/hooks/useUserSetupGuard';
import { confirmUserOffers } from '@/kiebitz/user/invitation';
import { ephemeralECDHEncrypt } from '@/helpers/crypto';

const UserSlotsSelectionFeature = () => {
    const [userSecret] = useUserSecret();
    const [userTokenData] = useUserTokenData();

    // We don't want users to use this page that haven't gone through the setup.
    useUserSetupGuard(userSecret, userTokenData);

    // TODO: We don't want users to use this page if they already have a confirmed invitation.
    // TODO: useUserInvitationConfirmedGuard();

    // `_offers` is only used for offer confirmation.
    const [slots, invitation] = useAvailableUserSlots();
    const availableProviders = [{ provider: invitation?.provider, slots }];

    const history = useHistory();

    // TODO: This needs to be able to handle multiple providers in the future.
    const handleSlotsSubmit = async (slotIds: string[]) => {
        const providerData = {
            signedToken: userTokenData.signedToken,
            userData: userTokenData.hashData,
        };

        const [encryptedProviderData] = await ephemeralECDHEncrypt(JSON.stringify(providerData), invitation.publicKey);

        const offers = (invitation?.offers ?? []).filter((offer) => !!slotIds.find((id) => id === offer.id));

        if (!offers.length) {
            console.error('Please choose offers.');
            return;
        }

        await confirmUserOffers(offers, encryptedProviderData, invitation, userTokenData);
        history.push('/user/appointments/success');
    };

    const renderAvailableProvider = (data: { provider: any; slots: SlotsByDay[] }): React.ReactNode => {
        if (!data.provider) {
            return null;
        }

        const { provider, slots } = data;
        const { signature, json } = provider;
        const { name, street, zipCode, city, accessible, email, description, website, phone } = json;

        return (
            <ProviderSlotsCard
                key={signature}
                name={name}
                street={street}
                zip={zipCode}
                city={city}
                email={email}
                desc={description}
                website={website}
                phone={phone}
                isAccessible={accessible}
                slots={slots}
                onSlotsSubmit={handleSlotsSubmit}
            />
        );
    };

    return (
        <div className="container mx-auto 2xl:pt-24 pt-12">
            <HeroTitle title="Aktuelle Impfangebote" className="mx-auto 2xl:mb-24 mb-12" />
            {/* For when we support multiple docs: "grid grid-cols-1 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2" */}
            <div className="gap-8 p-4">{availableProviders.map(renderAvailableProvider)}</div>
        </div>
    );
};

export default UserSlotsSelectionFeature;
