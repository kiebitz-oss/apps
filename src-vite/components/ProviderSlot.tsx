import React, { ReactNode, useMemo } from 'react';
import { Slot, Vaccine } from '@/types';
import { getReadableTimeFromDate } from '../utils/intl';
import { FiClock } from 'react-icons/fi';
import { getReadableVaccine } from '../utils/slots';
import classNames from 'classnames';

export interface ProviderSlotProps extends Omit<Slot, 'id'>, React.HTMLAttributes<HTMLDivElement> {
    selectionRank?: number;
    onClickSlot: (vaccine: Vaccine) => void;
}

const ProviderSlot: React.FC<ProviderSlotProps> = (props) => {
    const { date, vaccines, duration, selectionRank, onClickSlot, className, ...divProps } = props;
    const durationInMillis = useMemo<number>(() => duration * 60000, [duration]);

    const readableStartTime = getReadableTimeFromDate(date, 'de-DE', { hour: '2-digit', minute: '2-digit' });
    const readableEndTime = getReadableTimeFromDate(new Date(date.getTime() + durationInMillis), 'de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const renderVaccine = (vaccine: Vaccine): ReactNode => {
        const handleVaccineClick = () => onClickSlot(vaccine);
        return (
            <div
                key={vaccine}
                onClick={handleVaccineClick}
                className={classNames(
                    'flex items-center justify-between p-2 px-4 transition-all duration-100 ease-in-out rounded cursor-pointer group hover:bg-brand-user',
                    selectionRank ? 'bg-brand-user' : 'bg-brand-user-light-2'
                )}
            >
                <p
                    className={classNames(
                        'font-medium  group-hover:text-white',
                        selectionRank ? 'text-white' : 'text-gray-900'
                    )}
                >
                    {selectionRank ? `${selectionRank}.` : ''} {getReadableVaccine(vaccine)}
                </p>
            </div>
        );
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
            {vaccines.map(renderVaccine)}
        </div>
    );
};

export default ProviderSlot;
