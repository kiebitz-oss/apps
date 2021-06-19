import React, { useState } from 'react';
import { FaRegUserCircle } from 'react-icons/fa';
import ProviderSlots from '@/components/ProviderSlots';
import { Slot } from '@/types';
import { Button } from '@/components/Button';
import { SlotsByDay } from '@/hooks/useAvailableUserSlots';

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
    slots: SlotsByDay[];
    onSlotsSubmit: (slotIds: string[]) => Promise<void> | void;
}

const ProviderSlotsCard: React.FC<ProviderOffersCardProps> = (props) => {
    const { name, street, zip, city, email, phone, website, desc, isAccessible, slots = [], onSlotsSubmit } = props;

    const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

    const toggleSlot = (slotId: string) => {
        const index = selectedSlotIds.indexOf(slotId);
        const exists = index !== -1;
        if (exists) {
            selectedSlotIds.splice(index, 1);
            setSelectedSlotIds([...selectedSlotIds]);
        } else {
            setSelectedSlotIds([...selectedSlotIds, slotId]);
        }
    };

    const renderSlots = ([day, slotsByTime]) => {
        return (
            <ProviderSlots
                key={day}
                date={new Date(day)}
                slots={slotsByTime}
                selectedSlotIds={selectedSlotIds}
                onClickSlot={(slot) => toggleSlot(slot.id)}
            />
        );
    };

    const handleSubmit = () => {
        onSlotsSubmit(selectedSlotIds);
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
            <form>
                <div className="grid lg:grid-rows-1 lg:grid-cols-5 grid-cols-1 gap-8">{slots.map(renderSlots)}</div>
                <div className="flex justify-end">
                    <Button
                        scheme="user"
                        onClick={() => setSelectedSlotIds([])}
                        className="mr-2"
                        disabled={!selectedSlotIds.length}
                    >
                        Zurücksetzen
                    </Button>
                    <Button scheme="user" disabled={!selectedSlotIds.length} onClick={handleSubmit}>
                        Auswählen
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProviderSlotsCard;
