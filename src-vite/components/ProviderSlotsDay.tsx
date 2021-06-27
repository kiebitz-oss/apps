import React from 'react';
import { Slot } from '@/types';
import { getReadableDateFromDate } from '../utils/intl';
import ProviderSlotsTime from '@/components/ProviderSlotsTime';
import { RankedSlotsByTime } from '@/hooks/useRankedSlots';

export interface ProviderSlotsProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    slots: RankedSlotsByTime[];
    onClickSlot: (slot: Slot) => void;
}

const ProviderSlotsDay: React.FC<ProviderSlotsProps> = (props) => {
    const { date, slots, onClickSlot } = props;

    const renderRankedSlotsByTime = ([time, slotsByDuration]: RankedSlotsByTime): React.ReactNode => {
        const handleClickSlot = (slot: Slot) => onClickSlot(slot);
        return (
            <ProviderSlotsTime
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
        <div className="rounded-lg bg-brand-user-light-3 lg:p-8 p-4 w-full">
            <h4 className="mb-2 font-semibold text-xl uppercase text-brand-user-dark">{readableDate}</h4>
            <div className="space-y-6">{slots.map(renderRankedSlotsByTime)}</div>
        </div>
    );
};

export default ProviderSlotsDay;
