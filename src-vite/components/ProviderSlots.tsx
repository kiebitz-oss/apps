import React from 'react';
import ProviderSlotsDay from '@/components/ProviderSlotsDay';
import { Button } from '@/components/Button';
import { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import useRankedSlots, { RankedSlotsByDay } from '@/hooks/useRankedSlots';
import ProviderDisplay from '@/components/ProviderDisplay';

interface ProviderOffersCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    street: string;
    zip: string;
    city: string;
    website?: string;
    desc?: string;
    isAccessible: boolean;
    slots: SlotsByDay[];
    onSlotsSubmit: (slotIds: string[]) => Promise<void> | void;
}

const ProviderSlots: React.FC<ProviderOffersCardProps> = (props) => {
    const { name, street, zip, city, website, desc, isAccessible, slots = [], onSlotsSubmit } = props;

    const [rankedSlots, rankedSlotsIds, toggleSlot] = useRankedSlots(slots);

    const renderRankedSlot = ([day, slotsByTime]: RankedSlotsByDay) => {
        return (
            <ProviderSlotsDay
                key={day.toLocaleDateString()}
                date={day}
                slots={slotsByTime}
                onClickSlot={(slot) => toggleSlot(slot.id)}
            />
        );
    };

    const handleSubmit = () => {
        onSlotsSubmit(rankedSlotsIds);
    };

    console.log(rankedSlotsIds);

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
            <form>
                <div className="space-y-4 relative">
                    <div className="space-y-8">{rankedSlots.map(renderRankedSlot)}</div>
                    <div className="sticky bottom-4 bg-white p-4 rounded-lg space-y-4 shadow-md">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-lg">
                                Du hast{' '}
                                {rankedSlotsIds.length ? (
                                    <span className="text-[#3DDC97]">{rankedSlotsIds.length}</span>
                                ) : (
                                    'noch keine'
                                )}{' '}
                                Termine ausgewählt.
                            </span>
                            <Button
                                scheme="primary"
                                disabled={!rankedSlotsIds.length}
                                onClick={handleSubmit}
                                className="uppercase"
                            >
                                Bestätigen
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default ProviderSlots;
