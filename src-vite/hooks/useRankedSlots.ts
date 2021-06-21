import { useCallback, useState } from 'react';
import { Slot } from '@/types';
import { SlotsByDay, SlotsByDuration, SlotsByTime } from '@/hooks/useAvailableUserSlots';

export type RankedSlot = Slot & { rank?: number };
export type RankedSlotsByDuration = [SlotsByDuration[0], RankedSlot[]];
export type RankedSlotsByTime = [SlotsByTime[0], RankedSlotsByDuration[]];
export type RankedSlotsByDay = [SlotsByDay[0], RankedSlotsByTime[]];

const useRankedSlots = (
    slots: SlotsByDay[]
): [
    rankedSlots: RankedSlotsByDay[],
    rankedSlotsIds: string[],
    toggleSlot: (slotId: string) => void,
    resetRankedSlots: () => void
] => {
    const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

    const rankedSlots = slots.map<RankedSlotsByDay>(([day, slotsByDay]) => [
        day,
        slotsByDay.map<RankedSlotsByTime>(([time, slotsByTime]) => [
            time,
            slotsByTime.map<RankedSlotsByDuration>(([duration, slotsByDuration]) => [
                duration,
                slotsByDuration.map<RankedSlot>((slot) => {
                    const index = selectedSlotIds.findIndex((id) => id === slot.id);
                    return {
                        ...slot,
                        rank: index !== -1 ? index + 1 : undefined,
                    };
                }),
            ]),
        ]),
    ]);

    const toggleSlot = useCallback(
        (slotId: string) => {
            const index = selectedSlotIds.indexOf(slotId);
            const exists = index !== -1;
            if (exists) {
                selectedSlotIds.splice(index, 1);
                setSelectedSlotIds([...selectedSlotIds]);
            } else {
                setSelectedSlotIds([...selectedSlotIds, slotId]);
            }
        },
        [selectedSlotIds]
    );

    const reset = () => setSelectedSlotIds([]);

    return [rankedSlots, selectedSlotIds, toggleSlot, reset];
};

export default useRankedSlots;
