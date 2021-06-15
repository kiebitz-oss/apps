import React from 'react';
import { FaRegUserCircle } from 'react-icons/fa';

import { ProviderSlotProps } from '@/components/ProviderSlot';
import ProviderSlots from '@/components/ProviderSlots';
import { Vaccine } from '@/types';

interface ProviderOffersCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    street: string;
    zip: string;
    city: string;
    email?: string;
    phone?: string;
    website?: string;
    desc?: string;
    isAccessible: boolean;
    slots: [day: string, slots: Omit<ProviderSlotProps, 'onClickSlot'>[]][];
    onClickOffer: (offer: Omit<ProviderSlotProps, 'onClickSlot'>, vaccine: Vaccine) => void;
}

const ProviderSlotsCard: React.FC<ProviderOffersCardProps> = (props) => {
    const { name, street, zip, city, email, phone, website, desc, isAccessible, slots = [], onClickOffer } = props;

    const renderSlots = (slot: [day: string, slots: Omit<ProviderSlotProps, 'onClickSlot'>[]]) => {
        const [day, slots] = slot;
        return <ProviderSlots date={new Date(day)} slots={slots} onClickSlot={onClickOffer} />;
    };

    return (
        <div className="p-6 mb-8 bg-white rounded shadow-lg">
            <div className="flex mb-8">
                <div>
                    <FaRegUserCircle className="text-3xl text-brand-provider" />
                </div>
                <div className="flex flex-col ml-4">
                    <div className="mb-2">
                        <h6 className="text-xl font-semibold">{name}</h6>
                        <p>{desc}</p>
                    </div>

                    <div className="mb-2">
                        <p>Adresse:</p>
                        <p>{street}</p>
                        <p>
                            {zip}, {city}
                        </p>
                    </div>
                    <div className="mb-2">
                        <p>Weiteres:</p>
                        {email && <p>E-Mail: {email}</p>}
                        {phone && <p>Telefon: {phone}</p>}
                        {website && (
                            <p>
                                Website:{' '}
                                <a
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    href={website}
                                    rel="noreferrer noopener"
                                >
                                    {website}
                                </a>
                            </p>
                        )}
                        <p>Barrierefrei: {isAccessible ? 'Ja' : 'Nein'}</p>
                    </div>
                </div>
            </div>
            {slots.map(renderSlots)}
        </div>
    );
};

export default ProviderSlotsCard;
