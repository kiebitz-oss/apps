import React from 'react';

import ProviderSlotsCard from '@/components/ProviderSlotsCard';
import { HeroTitle } from '@/components/HeroTitle';
import useAvailableUserSlots from '@/hooks/useAvailableUserSlots';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';
import useUserSetupGuard from '@/hooks/useUserSetupGuard';

const UserSlotsSelectionFeature = () => {
    const [userSecret] = useUserSecret();
    const [userTokenData] = useUserTokenData();

    // We don't want users to use this page that haven't gone through the setup.
    useUserSetupGuard(userSecret, userTokenData);

    // TODO: We don't want users to use this page if they already have a confirmed invitation.
    // TODO: useUserInvitationConfirmedGuard();

    const [slots, _provider] = useAvailableUserSlots();

    console.log(slots);

    const providerOffers = [{ provider: _provider, offers: slots }];

    const handleSlotsSubmit = (slotIds) => {
        console.log('IN PARENT', slotIds);
    };

    const renderProvider = (data): React.ReactNode => {
        if (!data.provider) {
            return null;
        }

        const { signature, json } = data.provider;
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
            <div className="gap-8 p-4">{providerOffers.map(renderProvider)}</div>
        </div>
    );
};

export default UserSlotsSelectionFeature;
