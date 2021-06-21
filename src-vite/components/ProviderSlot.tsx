import React, { ReactNode } from 'react';
import { Slot, Vaccine } from '@/types';
import { getReadableVaccine } from '../utils/slots';
import classNames from 'classnames';

export interface ProviderSlotProps extends React.HTMLAttributes<HTMLDivElement> {
    _id: Slot['id'];
    vaccines: Vaccine[];
    rank?: number;
    onClickSlot: () => Promise<void> | void;
}

const ProviderSlot: React.FC<ProviderSlotProps> = (props) => {
    const { _id, vaccines, rank, onClickSlot, className, ...divProps } = props;

    const renderVaccine = (vaccine: Vaccine): ReactNode => {
        return (
            <div
                key={`${_id}_${vaccine}`}
                onClick={onClickSlot}
                className={classNames(
                    'flex items-center justify-between p-2 px-4 transition-all duration-100 ease-in-out rounded cursor-pointer group hover:bg-brand-user',
                    rank ? 'bg-brand-user' : 'bg-brand-user-light-2'
                )}
            >
                <p className={classNames('font-medium  group-hover:text-white', rank ? 'text-white' : 'text-gray-900')}>
                    {rank ? `${rank}.` : ''} {getReadableVaccine(vaccine)}
                </p>
            </div>
        );
    };

    return (
        <div className={classNames(className)} {...divProps}>
            {vaccines.map(renderVaccine)}
        </div>
    );
};

export default ProviderSlot;
