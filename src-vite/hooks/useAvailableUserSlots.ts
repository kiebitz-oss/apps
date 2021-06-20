import { useEffect, useMemo, useState } from 'react';

import { getUserTokenData } from '@/kiebitz/user/token-data';
import { getKeys } from '@/kiebitz/user/keys';
import { getUserDecryptedInvitationData } from '@/kiebitz/user/invitation';
import { getSlotFromOffer, mergeMultiDimensionalTupleMap, MultidimensionalTuple } from '../utils/slots';
import { Slot } from '@/types';

// Deliberate naming 'offers' from backend since we haven't transformed to 'slots' yet.
const getOffersForTokenData = async (tokenData) => {
    const keys = await getKeys();
    const decryptedData = await getUserDecryptedInvitationData(keys, tokenData);

    const { offers, provider } = decryptedData.data;

    return [offers, provider];
};

export type SlotsByDuration = [duration: number, slots: Slot[]];
export type SlotsByTime = [time: Date, slotsByDuration: SlotsByDuration[]];
export type SlotsByDay = [day: Date, slotsByTime: SlotsByTime[]];

// The return type of this can be referenced to as slotsByDayAndTime.
export const getSlotsFromOffers = (offers: any[]): SlotsByDay[] => {
    return offers.reduce<SlotsByDay[]>((prev, offer) => {
        console.log('prev', prev);
        const slot = getSlotFromOffer(offer);
        let next;
        try {
            next = mergeMultiDimensionalTupleMap(
                [slot.date, [slot.date, [slot.duration, [slot]]]] as MultidimensionalTuple,
                prev as MultidimensionalTuple[],
                [
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
                ]
            );
        } catch (error) {
            console.error('!"§', error);
        }

        console.log('next', next);
        return next;
    }, []);

    // const slotsByDayMap = offers.reduce<{ [day: string]: Slot[] }>((prev, offer) => {
    //     const slot = getSlotFromOffer(offer);
    //     const key = slot.date.toLocaleDateString();
    //
    //     const current = [...(prev[key] ?? [])];
    //     const next = [...current, slot];
    //
    //     // Sorting them ascending by time and duration to easily display in the UI.
    //     prev[key] = next.sort((a, b) => {
    //         const dateSort = byDateSorter('date', SortingDirection.ASCENDING)(a, b);
    //         if (dateSort !== 0) return dateSort;
    //
    //         return byNumericSorter('duration', SortingDirection.ASCENDING)(a, b);
    //     });
    //     return prev;
    // }, {});
    //
    // const slotsByDays: SlotsByDay[] = Object.entries(slotsByDayMap).map((slotsByDay) => {
    //     const [day, slotsForDay] = slotsByDay;
    //
    //     const slotsByTimeMap = slotsForDay.reduce<{ [time: string]: Slot[] }>((prev, slot) => {
    //         const key = slot.date.toLocaleTimeString();
    //         prev[key] = [...(prev[key] ?? []), slot];
    //         return prev;
    //     }, {});
    //
    //     const slotsByTimes: SlotsByTime[] = Object.entries(slotsByTimeMap).map((slotsByTime) => {
    //         const [time, slotsForTime] = slotsByTime;
    //
    //         const slotsByDurationMap = slotsForTime.reduce<{ [duration: number]: Slot[] }>((prev, slot) => {
    //             const key = slot.duration;
    //             prev[key] = [...(prev[key] ?? []), slot];
    //             return prev;
    //         }, {});
    //
    //         const slotsByDuration: SlotsByDuration[] = Object.entries(slotsByDurationMap).map(([duration, slots]) => [
    //             Number.parseInt(duration, 10),
    //             slots,
    //         ]);
    //
    //         return [time, slotsByDuration];
    //     });
    //
    //     return [day, slotsByTimes] as SlotsByDay;
    // });
    //
    // // Sorting ascending by day to easily display in the UI.
    // return slotsByDays.sort(([dayA], [dayB]) => (dayB > dayA ? -1 : 1));
};

const useAvailableUserSlots = (): [SlotsByDay[], any] => {
    const [slots, setSlots] = useState([]);

    const slotsByDay = useMemo<SlotsByDay[]>(() => getSlotsFromOffers(slots), [slots]);

    console.log('HERE', slotsByDay);

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
