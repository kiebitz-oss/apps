import React from 'react';
import ProviderSlot, { ProviderSlotProps } from '@/components/ProviderSlot';
import { Vaccine } from '@/types';
import { getReadableDateFromDate } from '../utils/intl';
import classNames from 'classnames';

export interface ProviderSlotsProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    slots: Omit<ProviderSlotProps, 'onClickSlot'>[];
    onClickSlot: (slot: Omit<ProviderSlotProps, 'onClickSlot'>, vaccine: Vaccine) => void;
}

const ProviderSlots: React.FC<ProviderSlotsProps> = (props) => {
    const { date, slots, onClickSlot } = props;

    const renderSlot = (
        slot: Omit<ProviderSlotProps, 'onClickSlot'>,
        i: number,
        arr: Omit<ProviderSlotProps, 'onClickSlot'>[]
    ): React.ReactNode => {
        const isLast = arr.length - 1 === i;
        const { date, vaccines, duration } = slot;

        const handleClickSlot = (vaccine: Vaccine) => {
            onClickSlot(slot, vaccine);
        };

        return (
            <ProviderSlot
                date={date}
                vaccines={vaccines}
                duration={duration}
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
