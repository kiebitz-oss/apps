import React from 'react';
import { FaRegUserCircle, FaWheelchair, FaExternalLinkAlt } from 'react-icons/fa';
import ProviderSlotsDay from '@/components/ProviderSlotsDay';
import { Button } from '@/components/Button';
import { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import useRankedSlots, { RankedSlotsByDay } from '@/hooks/useRankedSlots';
import classNames from 'classnames';

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
        <>
            <div className="mb-4 space-y-4">
                <div className="flex items-center">
                    <FaRegUserCircle className="text-4xl text-brand-user mr-4" />
                    <h6 className="text-xl">{name}</h6>
                </div>
                <p className="text-gray-800">{desc}</p>
                <div>
                    <p className="text-gray-800 font-semibold">{street}</p>
                    <p className="text-gray-800 font-semibold">
                        {zip}, {city}
                    </p>
                </div>
                <div className="flex items-center">
                    <FaWheelchair className="text-xl text-brand-user mr-2" />
                    <p className={classNames(!isAccessible && 'text-red-500', 'text-gray-800')}>
                        {!isAccessible ? 'Nicht ' : ''}Barrierefrei
                    </p>
                </div>
                {website ? (
                    <div className="flex items-center">
                        <FaExternalLinkAlt className="text-xl text-brand-user mr-2" />
                        <a
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            href={website}
                            rel="noreferrer noopener"
                        >
                            {website}
                        </a>
                    </div>
                ) : null}
            </div>
            <form>
                <div className="space-y-4">
                    <div className="space-y-8">{rankedSlots.map(renderRankedSlot)}</div>
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
                </div>
            </form>
        </>
    );
};

export default ProviderSlots;
