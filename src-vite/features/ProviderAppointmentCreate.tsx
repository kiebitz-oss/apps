import React from 'react';
import { CalendarOutline } from 'heroicons-react';

import { Button } from '@/components/Button';
import { DateInput } from '@/components/DateInput';
import { HeroTitle } from '@/components/HeroTitle';
import { Input } from '@/components/Input';

const ProviderAppointmentCreate: React.FC = () => {
    return (
        <div className="container mx-auto 2xl:pt-24 pt-12">
            <HeroTitle
                title="Mein Impfangebot"
                desc="Geben Sie schnell und einfach bekannt, zu welcher Zeit Sie welchen Impfstoff anbieten können."
                className="mx-auto mb-24"
            />
            <div className="max-w-2xl mx-auto bg-white divide-y divide-gray-200 rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                    <p className="mb-4 text-4xl">Impfslots</p>
                    <div className="mb-4">
                        <label className="block mb-2 text-xl font-semibold">Datum und Uhrzeit</label>
                        <div className="flex -mx-2">
                            <DateInput
                                className="px-2"
                                placeholder="Datum auswählen"
                                trailingIcon={<CalendarOutline />}
                            />
                            <Input className="px-2" placeholder="von" type="time" />
                            <Input className="px-2" placeholder="bis" type="time" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 text-xl font-semibold">Verfügbare Impfstoffe</label>
                        <div className="flex -mx-2">
                            <Input className="px-2" placeholder="Menge" />
                            <Input className="px-2" placeholder="Menge" />
                            <Input className="px-2" placeholder="Menge" />
                            <Input className="px-2" placeholder="Menge" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end px-4 py-4 sm:px-6">
                    <Button scheme="user">Postleitzahl prüfen</Button>
                </div>
            </div>
        </div>
    );
};

export default ProviderAppointmentCreate;
