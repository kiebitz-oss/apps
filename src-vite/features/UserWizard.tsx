import { setUserTemporaryQueueData, UserQueueData } from '../../kiebitz/user/queue';
import React, { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import { HeroTitle } from '../components/HeroTitle';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Toggle } from '../components/Toggle';

const distances = { '5km': 5, '10km': 10, '20km': 20, '30km': 30, '40km': 40, '50km': 50 };

export const UserWizard = () => {
    const [distance, setDistance] = useState(distances[0]);
    const [accessible, setAccessible] = useState(false);
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const zipCode = formData.get('zip') as string;
        const code = formData.get('code') as string;
        const res = await setUserTemporaryQueueData({ accessible, distance, zipCode });
    };

    return (
        <>
            <HeroTitle
                title="Willkommen"
                desc="Dieser Assistent hilft Dir bei der Impfanmeldung"
                className="mx-auto mb-24"
            />
            <form onSubmit={handleSubmit}>
                <div className="max-w-2xl mx-auto bg-white divide-y divide-gray-200 rounded-lg shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="mb-4 space-y-4">
                            <Input
                                label="Zugangscode aus deiner E-Mail"
                                placeholder="fb892bcc42124679dd4e2aeb935b1c99"
                                required
                            />
                            <Input label="Postleitzahl deines Wohnorts" placeholder="38259" required />
                            <Select
                                value={distance}
                                values={Object.keys(distances)}
                                onChange={setDistance}
                                label="Maximale Entfernung zum Impfort in Kilometern (km)"
                            />
                            <Toggle
                                label="Barrierefreier Impfort gewünscht"
                                value={accessible}
                                onChange={setAccessible}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end px-4 py-4 sm:px-6">
                        <Button scheme="brandUser">Postleitzahl prüfen</Button>
                    </div>
                </div>
            </form>
        </>
    );
};
