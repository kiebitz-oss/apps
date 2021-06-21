import React from 'react';
import classNames from 'classnames';
import { Slot } from '@/types';
import { getReadableDateFromDate } from '../utils/intl';
import ProviderSlotsTime from '@/components/ProviderSlotsTime';
import { RankedSlotsByDay, RankedSlotsByTime } from '@/hooks/useRankedSlots';

export interface ProviderSlotsProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    slots: RankedSlotsByTime[];
    onClickSlot: (slot: Slot) => void;
}

const ProviderSlotsDay: React.FC<ProviderSlotsProps> = (props) => {
    const { date, slots, onClickSlot } = props;

    /*
    *
    * const indexInSelectedSlotIds = selectedSlotIds.indexOf(slot.id);
        const selectionRank = indexInSelectedSlotIds === -1 ? undefined : indexInSelectedSlotIds + 1;
        const isLast = arr.length - 1 === i;
        const { date, vaccines, duration } = slot;*/

    const renderRankedSlotsByTime = (
        [time, slotsByDuration]: RankedSlotsByTime,
        i: number,
        arr: RankedSlotsByTime[]
    ): React.ReactNode => {
        const isLast = i === arr.length - 1;
        const handleClickSlot = (slot: Slot) => onClickSlot(slot);
        return (
            <ProviderSlotsTime
                className={classNames(isLast ? 'mb-0' : 'mb-8')}
                key={time.toLocaleTimeString()}
                date={time}
                slots={slotsByDuration}
                onClickSlot={handleClickSlot}
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
            {slots.map(renderRankedSlotsByTime)}
        </div>
    );
};

export default ProviderSlotsDay;
