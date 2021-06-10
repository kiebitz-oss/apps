import React, { FC, ReactNode } from 'react';
import { DateTime } from 'luxon';
import { FiClock } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { getReadableDateFromTimestamp, getReadableTimeFromTimestamp } from '../utils/intl';

export interface AppointmentSlotProps extends React.HTMLAttributes<HTMLDivElement> {
    startTime: number;
    endTime: number;
    vaccines: string[];
    onClickVaccine: (vaccine: string) => void;
}

export const AppointmentSlot: FC<AppointmentSlotProps> = (props) => {
    const { startTime, endTime, vaccines, onClickVaccine } = props;

    const readableStartTimeDate = getReadableDateFromTimestamp(startTime, 'de-DE', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
    });
    const readableStartTime = getReadableTimeFromTimestamp(startTime, 'de-DE', { hour: '2-digit', minute: '2-digit' });
    const readableEndTime = getReadableTimeFromTimestamp(endTime, 'de-DE', { hour: '2-digit', minute: '2-digit' });

    const renderVaccine = (vaccine: string): ReactNode => {
        return (
            <div
                key={vaccine}
                onClick={() => onClickVaccine(vaccine)}
                className="flex items-center justify-between p-2 px-4 mb-2 transition-all duration-300 ease-in-out rounded cursor-pointer group bg-brand-user-light-3 hover:bg-brand-user-light"
            >
                <p className="font-medium text-gray-900 group-hover:text-white">{vaccine}</p>
                <div className="flex items-center">
                    <HiOutlineArrowNarrowRight className="mr-2 text-xl md:text-2xl text-brand-user group-hover:text-white" />
                    <p className="text-xs font-medium md:text-sm text-brand-user group-hover:text-white">
                        Jetzt buchen
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full mt-10">
            <h4 className="mb-2 uppercase text-brand-user">{readableStartTimeDate}</h4>

            <div className="flex items-center w-full p-2 mb-4 rounded bg-brand-user">
                <FiClock className="mr-2 text-xl text-white" />
                <h5 className="text-base font-semibold text-white">
                    {readableStartTime} Uhr - {readableEndTime} Uhr
                </h5>
            </div>

            <h6 className="mb-4 text-xs font-semibold text-gray-400 uppercase md:text-sm">Angebotene Impfstoffe:</h6>
            {vaccines.map(renderVaccine)}
        </div>
    );
};
