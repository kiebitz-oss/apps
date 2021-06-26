import React from 'react';
import { useHistory } from 'react-router-dom';
import ProviderSlots from '@/components/ProviderSlots';
import { HeroTitle } from '@/components/HeroTitle';
import useAvailableUserSlots, { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';
import useUserSetupGuard from '@/hooks/useUserSetupGuard';
import { confirmUserOffers } from '@/kiebitz/user/invitation';
import { ephemeralECDHEncrypt } from '@/helpers/crypto';
import Card from '@/components/Card';

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
        <div className="container mx-auto min-h-screen 2xl:pt-24 py-12 2xl:w-1/4 lg:w-1/2">
            <Card className="lg:rounded-lg">
                <h1 className="text-4xl mb-2 text-brand-user">Aktuelle Impfangebote</h1>
                <p>
                    Im folgenden siehst du aktuelle Impfangebote eines Arztes, aufgeteilt nach Tag, Uhrzeit und Dauer.
                    Du kannst zwischen verschiedenen Impfstoffen auswählen, welche jeweils mit dem Eigennamen und den
                    Herstellern angegeben sind.
                </p>
                <div className="divider" />
                {availableProviders.map(renderAvailableProvider)}
            </Card>
        </div>
    );
};

export default UserSlotsSelectionFeature;
