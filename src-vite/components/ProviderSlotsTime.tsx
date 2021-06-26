import React from 'react';
import { SlotsByDuration } from '@/hooks/useAvailableUserSlots';
import { Slot } from '@/types';
import ProviderSlotsDuration from '@/components/ProviderSlotsDuration';
import classNames from 'classnames';
import { RankedSlotsByDuration } from '@/hooks/useRankedSlots';

export interface ProviderSlotsTimeProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    slots: RankedSlotsByDuration[];
    onClickSlot: (slot: Slot) => Promise<void> | void;
}

const ProviderSlotsTime: React.FC<ProviderSlotsTimeProps> = (props) => {
    const { date, slots, onClickSlot, className, ...divProps } = props;

    const handleRenderSlot = ([duration, slots]: SlotsByDuration) => {
        const handleClickSlot = (slot: Slot) => onClickSlot(slot);
        return (
            <ProviderSlotsDuration
                key={duration}
                date={date}
                duration={duration}
                slots={slots}
                onClickSlot={handleClickSlot}
            />
        );
    };

    return (
        <div className={classNames('space-y-4', className)} {...divProps}>
            {slots.map(handleRenderSlot)}
        </div>
    );
};

export default ProviderSlotsTime;
