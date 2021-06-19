import React from 'react';
import classNames from 'classnames';
import { Slot } from '@/types';
import ProviderSlot from '@/components/ProviderSlot';
import { getReadableDateFromDate } from '../utils/intl';
import { SlotsByTime } from '@/hooks/useAvailableUserSlots';

export interface ProviderSlotsProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    slots: SlotsByTime[];
    selectedSlotIds: string[];
    onClickSlot: (slot: Slot) => void;
}

const ProviderSlots: React.FC<ProviderSlotsProps> = (props) => {
    const { date, slots, selectedSlotIds, onClickSlot } = props;

    const renderSlot = ([time, slotsByDuration], i: number, arr: Slot[]): React.ReactNode => {
        const indexInSelectedSlotIds = selectedSlotIds.indexOf(slot.id);
        const selectionRank = indexInSelectedSlotIds === -1 ? undefined : indexInSelectedSlotIds + 1;
        const isLast = arr.length - 1 === i;
        const { date, vaccines, duration } = slot;

        const handleClickSlot = (slotId: string) => {
            onClickSlot(slot);
        };

        return (
            <ProviderSlot
                key={time}
                date={date}
                slots={slotsByDuration}
                duration={duration}
                selectionRank={selectionRank}
                onClickSlot={handleClickSlot}
                className={classNames(isLast ? 'mb-2' : 'mb-6')}
            />
        );
    };

    const readableDate = getReadableDateFromDate(date, 'de-DE', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
    });

    return (
        <div className="w-full mt-10">
            <h4 className="mb-2 font-semibold text-xl uppercase text-brand-user">{readableDate}</h4>
            {slots.map(renderSlot)}
        </div>
    );
};

export default ProviderSlots;
