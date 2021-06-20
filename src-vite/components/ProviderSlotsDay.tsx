import React from 'react';
import classNames from 'classnames';
import { Slot } from '@/types';
import ProviderSlot from '@/components/ProviderSlot';
import { getReadableDateFromDate } from '../utils/intl';
import { SlotsByTime } from '@/hooks/useAvailableUserSlots';
import ProviderSlotsTime from '@/components/ProviderSlotsTime';

export interface ProviderSlotsProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    slots: SlotsByTime[];
    selectedSlotIds: string[];
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

    const renderSlot = ([, slotsByDuration]: SlotsByTime): React.ReactNode => {
        const handleClickSlot = (slot: Slot) => onClickSlot(slot);
        return <ProviderSlotsTime date={date} slots={slotsByDuration} onClickSlot={handleClickSlot} />;
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

export default ProviderSlotsDay;
