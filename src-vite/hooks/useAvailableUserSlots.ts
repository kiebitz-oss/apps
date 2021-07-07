import { useEffect, useMemo, useState } from 'react';

import { getUserTokenData } from '@/kiebitz/user/token-data';
import { getKeys } from '@/kiebitz/user/keys';
import { getUserDecryptedInvitationData } from '@/kiebitz/user/invitation';
import { getSlotFromOffer, mergeMultiDimensionalTupleMap } from '../utils/slots';
import { Slot } from '@/types';

const getInvitationsForTokenData = async (tokenData): Promise<any[]> => {
    const keys = await getKeys();
    return await getUserDecryptedInvitationData(keys, tokenData);
};

export type SlotsByDuration = [duration: number, slots: Slot[]];
export type SlotsByTime = [time: Date, slotsByDuration: SlotsByDuration[]];
export type SlotsByDay = [day: Date, slotsByTime: SlotsByTime[]];

// The return type of this can be referenced to as slotsByDayAndTime.
export const getSlotsFromOffers = (offers: any[]): SlotsByDay[] => {
    return offers.reduce<SlotsByDay[]>((prev, offer) => {
        const slot = getSlotFromOffer(offer);
        return mergeMultiDimensionalTupleMap([[slot.date, [[slot.date, [[slot.duration, [slot]]]]]]], prev, [
            (_day: Date, day: Date) => {
                const isEqual = _day.toLocaleDateString() === day.toLocaleDateString();
                const isGreater = _day.toLocaleDateString() > day.toLocaleDateString();

                return isEqual ? 0 : isGreater ? 1 : -1;
            },
            (_time: Date, time: Date) => {
                const isEqual = _time.toLocaleTimeString() === time.toLocaleTimeString();
                const isGreater = _time.toLocaleTimeString() > time.toLocaleTimeString();

                return isEqual ? 0 : isGreater ? 1 : -1;
            },
            (_duration: number, duration: number) => {
                const isEqual = _duration === duration;
                const isGreater = _duration > duration;

                return isEqual ? 0 : isGreater ? 1 : -1;
            },
        ]);
    }, []);
};

const useAvailableUserSlots = (): [SlotsByDay[][], any[]] => {
    const [invitations, setInvitations] = useState<any>([]);

    const slotsByDayList = useMemo<SlotsByDay[][]>(
        () => invitations.map((invitation) => getSlotsFromOffers(invitation?.offers ?? [])),
        [invitations]
    );

    useEffect(() => {
        const tokenData = getUserTokenData();

        const runAndSet = async () => {
            const _invitations = await getInvitationsForTokenData(tokenData);
            setInvitations(_invitations);
        };

        runAndSet();
    }, []);

    return [slotsByDayList, invitations];
};

export default useAvailableUserSlots;
