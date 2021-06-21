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

    const handleRenderSlot = ([duration, slots]: SlotsByDuration, i: number, arr: SlotsByDuration[]) => {
        const isLast = i === arr.length - 1;

        const handleClickSlot = (slot: Slot) => onClickSlot(slot);
        return (
            <ProviderSlotsDuration
                className={classNames(isLast ? 'mb-0' : 'mb-8')}
                key={duration}
                date={date}
                duration={duration}
                slots={slots}
                onClickSlot={handleClickSlot}
            />
        );
    };

    return (
        <div className={classNames(className)} {...divProps}>
            {slots.map(handleRenderSlot)}
        </div>
    );
};

export default ProviderSlotsTime;
