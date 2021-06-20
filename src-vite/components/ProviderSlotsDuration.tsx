import React, { useMemo } from 'react';
import { Slot } from '@/types';
import { getReadableTimeFromDate } from '../utils/intl';
import classNames from 'classnames';
import { FiClock } from 'react-icons/fi';

export interface ProviderSlotsDurationProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    duration: number;
    slots: Slot[];
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

    const handleRenderSlot = (slot: Slot) => {
        return null;
    };

    return (
        <div className={classNames(className)} {...divProps}>
            <div className="flex items-center w-full p-2 mb-4 rounded bg-brand-user">
                <FiClock className="mr-2 text-xl text-white" />
                <h5 className="text-base font-semibold text-white">
                    {readableStartTime} Uhr - {readableEndTime} Uhr
                </h5>
            </div>

            <h6 className="mb-2 text-xs font-semibold text-gray-500 tracking-wide uppercase md:text-sm">Impfstoffe:</h6>
            {slots.map(handleRenderSlot)}
        </div>
    );
};

export default ProviderSlotsDuration;
