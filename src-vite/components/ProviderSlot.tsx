import React, { MouseEventHandler, ReactNode } from 'react';
import { FaCheck } from 'react-icons/fa';
import classNames from 'classnames';
import { Slot, Vaccine } from '@/types';
import { getReadableVaccine } from '../utils/slots';

export interface ProviderSlotProps extends React.HTMLAttributes<HTMLDivElement> {
    _id: Slot['id'];
    vaccines: Vaccine[];
    rank?: number;
    onClickSlot: () => Promise<void> | void;
}

const ProviderSlot: React.FC<ProviderSlotProps> = (props) => {
    const { _id, vaccines, rank, onClickSlot, className, ...divProps } = props;

    const handleClickSlot: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        onClickSlot();
    };

    const renderVaccine = (vaccine: Vaccine): ReactNode => {
        return (
            <button
                key={`${_id}_${vaccine}`}
                onClick={handleClickSlot}
                className={classNames(
                    'flex items-center justify-between lg:py-4 py-2 px-4 transition-all duration-100 ease-in-out rounded cursor-pointer group hover:bg-brand-user-dark w-full',
                    rank ? 'bg-brand-user-dark' : 'bg-brand-user'
                )}
            >
                <p className={classNames('font-medium text-white')}>
                    {rank ? `${rank}.` : ''} {getReadableVaccine(vaccine)}
                </p>
                {rank ? <FaCheck className="text-white text-xl" /> : <p className="text-white">Auswählen</p>}
            </button>
        );
    };

    return (
        <div className={classNames(className)} {...divProps}>
            {vaccines.map(renderVaccine)}
        </div>
    );
};

export default ProviderSlot;
