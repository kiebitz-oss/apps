import React, { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import ProviderSlotsCard from '@/components/ProviderSlotsCard';
import { HeroTitle } from '@/components/HeroTitle';
import useAvailableUserSlots, { getSlotsFromOffers } from '@/hooks/useAvailableUserSlots';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';
import { ProviderSlotProps } from '@/components/ProviderSlot';
import { Vaccine } from '@/types';

const UserSlotsSelectionFeature = () => {
    const [userSecret] = useUserSecret();
    const [userTokenData] = useUserTokenData();

    const history = useHistory();

    useEffect(() => {
        const hasNotCompletedSetupYet = !userSecret || !userTokenData;
        if (hasNotCompletedSetupYet) {
            history.replace('/user/setup');
        }
    }, [userSecret, userTokenData]);

    const [slots, _provider] = useAvailableUserSlots();

    const providerOffers = [{ provider: _provider, offers: slots }];

    const renderProvider = (data): React.ReactNode => {
        if (!data.provider) {
            return null;
        }

        const { signature, json } = data.provider;
        const { name, street, zipCode, city, accessible, email, description, website, phone } = json;

        const handleOfferClick = (clickedOffer: Omit<ProviderSlotProps, 'onClickSlot'>, clickedVaccine: Vaccine) => {
            // eslint-disable-next-line no-console
            console.log({ clickedOffer, clickedVaccine });
        };

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
                onClickOffer={handleOfferClick}
            />
        );
    };

    return (
        <div className="container mx-auto 2xl:pt-24 pt-12">
            <HeroTitle title="Aktuelle Impfangebote" className="mx-auto 2xl:mb-24 mb-12" />
            <div className="grid grid-cols-1 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-8 p-4">
                {providerOffers.map(renderProvider)}
            </div>
        </div>
    );
};

export default UserSlotsSelectionFeature;
