import { CalendarOutline } from 'heroicons-react';
import React from 'react';
import { Button } from '../components/Button';
import { DateInput } from '../components/DateInput';
import { HeroTitle } from '../components/HeroTitle';
import { Input } from '../components/Input';

export const ProviderAppointmentCreate = () => {
    return (
        <>
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
                                label="Datum"
                                labelHidden
                                placeholder="Datum auswählen"
                                trailingIcon={<CalendarOutline />}
                            />
                            <Input className="px-2" label="von" labelHidden placeholder="von" type="time" />
                            <Input className="px-2" label="bis" labelHidden placeholder="bis" type="time" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 text-xl font-semibold">Verfügbare Impfstoffe</label>
                        <div className="flex -mx-2">
                            <Input className="px-2" label="AstraZeneca" placeholder="Menge" />
                            <Input className="px-2" label="BioNTech" placeholder="Menge" />
                            <Input className="px-2" label="Moderna" placeholder="Menge" />
                            <Input className="px-2" label="Johnson&Johnson" placeholder="Menge" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end px-4 py-4 sm:px-6">
                    <Button scheme="brandUser">Postleitzahl prüfen</Button>
                </div>
            </div>
        </>
    );
};
