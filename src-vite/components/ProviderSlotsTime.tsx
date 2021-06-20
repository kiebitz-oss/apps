import React from 'react';
import { SlotsByDuration } from '@/hooks/useAvailableUserSlots';
import { Slot } from '@/types';
import ProviderSlotsDuration from '@/components/ProviderSlotsDuration';

export interface ProviderSlotsTimeProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    slots: SlotsByDuration[];
    onClickSlot: (slot: Slot) => Promise<void> | void;
}

const ProviderSlotsTime: React.FC<ProviderSlotsTimeProps> = (props) => {
    const { date, slots, onClickSlot } = props;

    const handleRenderSlot = ([duration, slots]: SlotsByDuration) => {
        const handleClickSlot = (slot: Slot) => onClickSlot(slot);
        return <ProviderSlotsDuration date={date} duration={duration} slots={slots} onClickSlot={handleClickSlot} />;
    };

    return <>{slots.map(handleRenderSlot)}</>;
};

export default ProviderSlotsTime;
