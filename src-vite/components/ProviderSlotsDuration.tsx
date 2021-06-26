import React, { useMemo } from 'react';
import { Slot } from '@/types';
import { getReadableTimeFromDate } from '../utils/intl';
import classNames from 'classnames';
import { FiClock } from 'react-icons/fi';
import ProviderSlot from '@/components/ProviderSlot';
import { RankedSlot } from '@/hooks/useRankedSlots';

export interface ProviderSlotsDurationProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    duration: number;
    slots: RankedSlot[];
    onClickSlot: (slot: Slot) => Promise<void> | void;
}

const ProviderSlotsDuration: React.FC<ProviderSlotsDurationProps> = (props) => {
    const { date, duration, slots, onClickSlot, className, ...divProps } = props;

    const durationInMillis = useMemo<number>(() => duration * 60000, [duration]);

    const readableStartTime = getReadableTimeFromDate(date, 'de-DE', { hour: '2-digit', minute: '2-digit' });
    const readableEndTime = getReadableTimeFromDate(new Date(date.getTime() + durationInMillis), 'de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleRenderSlot = (slot: RankedSlot) => {
        const handleClickSlot = () => onClickSlot(slot);
        return (
            <ProviderSlot
                key={slot.id}
                _id={slot.id}
                rank={slot.rank}
                vaccines={slot.vaccines}
                onClickSlot={handleClickSlot}
            />
        );
    };

    return (
        <div className={classNames(className, 'space-y-4')} {...divProps}>
            <div className="flex items-center w-full mb-4 text-brand-user-dark">
                <FiClock className="mr-2 text-2xl" />
                <h5 className="text-lg font-semibold">
                    {readableStartTime} Uhr - {readableEndTime} Uhr
                </h5>
            </div>
            <div className="space-y-2">{slots.map(handleRenderSlot)}</div>
        </div>
    );
};

export default ProviderSlotsDuration;
