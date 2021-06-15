import { useEffect, useMemo, useState } from 'react';

import { getUserTokenData } from '@/kiebitz/user/token-data';
import { getKeys } from '@/kiebitz/user/keys';
import { getUserDecryptedInvitationData } from '@/kiebitz/user/invitation';
import { ProviderSlotProps } from '@/components/ProviderSlot';
import { getSlotFromOffer } from '../utils/slots';

// Deliberate naming 'offers' from backend since we haven't transformed to 'slots' yet.
const getOffersForTokenData = async (tokenData) => {
    const keys = await getKeys();
    const decryptedData = await getUserDecryptedInvitationData(keys, tokenData);

    const { offers, provider } = decryptedData.data;

    return [offers, provider];
};

export const getSlotsFromOffers = (offers: any[]): [day: string, slots: Omit<ProviderSlotProps, 'onClickSlot'>[]][] => {
    const slotsByDayMap = offers.reduce((prev, offer) => {
        // Sorting them ascending by time to easily display in the UI.
        prev[offer.date] = [...(prev[offer.date] ?? []), getSlotFromOffer(offer)].sort(
            ({ time: timeA }, { time: timeB }) => (timeB > timeA ? -1 : 1)
        );
        return prev;
    }, {});

    const slotsByDay = Object.entries(slotsByDayMap);

    // Sorting ascending by day to easily display in the UI.
    return slotsByDay.sort(([dayA], [dayB]) => (dayB > dayA ? -1 : 1)) as unknown as [
        day: string,
        slots: Omit<ProviderSlotProps, 'onClickSlot'>[]
    ][];
    // TODO: Fix this TS hell above.
};

const useAvailableUserSlots = (): [[day: string, slots: Omit<ProviderSlotProps, 'onClickSlot'>[]][], any] => {
    const [slots, setSlots] = useState([]);

    const slotsByDay = useMemo<[day: string, slots: Omit<ProviderSlotProps, 'onClickSlot'>[]][]>(
        () => getSlotsFromOffers(slots),
        [slots]
    );

    const [provider, setProvider] = useState();

    useEffect(() => {
        const tokenData = getUserTokenData();

        const runAndSet = async () => {
            const slots = await getOffersForTokenData(tokenData);

            setSlots(slots[0]);
            setProvider(slots[1]);
        };

        runAndSet();
    }, []);

    return [slotsByDay, provider];
};

export default useAvailableUserSlots;
