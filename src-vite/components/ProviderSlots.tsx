import React from 'react';
import ProviderSlotsDay from '@/components/ProviderSlotsDay';
import { RankedSlotsByDay } from '@/hooks/useRankedSlots';
import ProviderDisplay from '@/components/ProviderDisplay';

interface ProviderOffersCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    street: string;
    zip: string;
    city: string;
    website?: string;
    desc?: string;
    isAccessible: boolean;
    slots: RankedSlotsByDay[];
    onToggleSlot: (slotId: string) => Promise<void> | void;
}

const ProviderSlots: React.FC<ProviderOffersCardProps> = (props) => {
    const { name, street, zip, city, website, desc, isAccessible, slots = [], onToggleSlot } = props;

    const renderRankedSlot = ([day, slotsByTime]: RankedSlotsByDay) => {
        return (
            <ProviderSlotsDay
                key={day.toLocaleDateString()}
                date={day}
                slots={slotsByTime}
                onClickSlot={(slot) => onToggleSlot(slot.id)}
            />
        );
    };

    return (
        <>
            <ProviderDisplay
                name={name}
                desc={desc}
                street={street}
                zip={zip}
                city={city}
                isAccessible={isAccessible}
                website={website}
            />
            <div className="space-y-4 relative">
                <div className="space-y-8">{slots.map(renderRankedSlot)}</div>
            </div>
        </>
    );
};

export default ProviderSlots;
