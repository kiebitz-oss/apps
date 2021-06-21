import React from 'react';
import { FaRegUserCircle } from 'react-icons/fa';
import ProviderSlotsDay from '@/components/ProviderSlotsDay';
import { Button } from '@/components/Button';
import { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import useRankedSlots, { RankedSlotsByDay } from '@/hooks/useRankedSlots';

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

    const [rankedSlots, rankedSlotsIds, toggleSlot, resetRankedSlots] = useRankedSlots(slots);

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
                <div className="grid lg:grid-rows-1 lg:grid-cols-5 grid-cols-1 gap-8">
                    {rankedSlots.map(renderRankedSlot)}
                </div>
                <div className="flex justify-end">
                    <Button
                        scheme="user"
                        onClick={() => resetRankedSlots()}
                        className="mr-2"
                        disabled={!rankedSlotsIds.length}
                    >
                        Zurücksetzen
                    </Button>
                    <Button scheme="user" disabled={!rankedSlotsIds.length} onClick={handleSubmit}>
                        Auswählen
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProviderSlotsCard;
