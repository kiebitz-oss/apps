import React from 'react';
import { Button } from '@/components/Button';
import { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import Card from '@/components/Card';
import ProviderSlots from '@/components/ProviderSlots';
import useRankedSlots from '@/hooks/useRankedSlots';

export interface UserSlotsSelectionFormProps extends React.HTMLAttributes<HTMLDivElement> {
    providers: any[];
    onSubmitSlots(slotIds: string[], invitationIndices: number[]): void;
}

const UserSlotsSelectionForm: React.FC<UserSlotsSelectionFormProps> = (props) => {
    const { providers, onSubmitSlots } = props;

    const [rankedSlotsForProviders, rankedSlotsIdsForProviders, toggleSlot] = useRankedSlots(providers);

    const handleSubmit = () => {
        const [slotIds, invitationIndices] = rankedSlotsIdsForProviders.reduce<
            [slotIds: string[], invitationIndices: number[]]
        >(
            (prev, curr) => {
                const currentSlotIds = prev[0];
                const currentInvitationIndices = prev[1];

                const clone: [slotIds: string[], invitationIndices: number[]] = [
                    [...currentSlotIds],
                    [...currentInvitationIndices],
                ];

                clone[0] = [...clone[0], curr];

                const index = rankedSlotsForProviders.findIndex((slotsByDayForProviders) => {
                    return slotsByDayForProviders.find(
                        ([, slotsByTime]) =>
                            !!slotsByTime.find(
                                ([, slotsByDuration]) =>
                                    !!slotsByDuration.find(([, slots]) => slots.find((slot) => slot.id === curr))
                            )
                    );
                });

                clone[1] = [...clone[1], index];

                return clone;
            },
            [[], []]
        );

        onSubmitSlots(slotIds, invitationIndices);
    };

    const renderRankedSlotsForProvider = (rankedSlots: SlotsByDay[], i): React.ReactNode => {
        const { provider } = providers[i];
        const { signature, json } = provider;
        const { name, street, zipCode, city, accessible, description, website } = json;

        return (
            <Card key={signature} className="lg:rounded-lg">
                <ProviderSlots
                    name={name}
                    street={street}
                    zip={zipCode}
                    city={city}
                    desc={description}
                    website={website}
                    isAccessible={accessible}
                    slots={rankedSlots}
                    onToggleSlot={toggleSlot}
                />
            </Card>
        );
    };

    return (
        <div>
            <form className="space-y-4">
                {rankedSlotsForProviders.map(renderRankedSlotsForProvider)}
                <div className="sticky bottom-4 bg-white p-4 rounded-lg space-y-4 shadow-md">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-lg">
                            Du hast{' '}
                            {rankedSlotsIdsForProviders.length ? (
                                <span className="text-[#3DDC97]">{rankedSlotsIdsForProviders.length}</span>
                            ) : (
                                'noch keine'
                            )}{' '}
                            Termine ausgewählt.
                        </span>
                        <Button
                            scheme="primary"
                            disabled={!rankedSlotsIdsForProviders.length}
                            onClick={handleSubmit}
                            className="uppercase"
                        >
                            Bestätigen
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserSlotsSelectionForm;
