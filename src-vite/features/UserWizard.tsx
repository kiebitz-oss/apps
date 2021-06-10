import { setUserTemporaryQueueData, UserQueueData } from '../../kiebitz/user/queue';
import React, { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import { HeroTitle } from '../components/HeroTitle';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Toggle } from '../components/Toggle';
import { Field } from '../components/Field';
import { Form } from '../components/Form';

const distances = { '5km': 5, '10km': 10, '20km': 20, '30km': 30, '40km': 40, '50km': 50 };
const plzRegex = /^[0-9]{5}$/;

type FormSubmitData = {
    code: string;
    plz: string;
    distance: string;
    accessible: boolean;
};

export const UserWizard = () => {
    const handleSubmit = async (data: FormSubmitData) => {
        // const res = await setUserTemporaryQueueData({ accessible, distance, zipCode });
        console.log({ data });
    };

    return (
        <>
            <HeroTitle
                title="Willkommen"
                desc="Dieser Assistent hilft Dir bei der Impfanmeldung"
                className="mx-auto mb-24"
            />
            <Form onSubmit={handleSubmit}>
                <div className="max-w-2xl mx-auto bg-white divide-y divide-gray-200 rounded-lg shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="mb-4 space-y-4">
                            <Field label="Zugangscode aus deiner E-Mail" name="code" isRequired>
                                <Input placeholder="fb892bcc42124679dd4e2aeb935b1c99" />
                            </Field>

                            <Field label="Postleitzahl deines Wohnorts" name="plz" pattern={plzRegex} isRequired>
                                <Input placeholder="38259" />
                            </Field>

                            <Field
                                label="E-Mail-Adresse"
                                name="email"
                                hint="Wenn Du die E-Mail-Adresse ändern willst, an die wir Dir Benachrichtigungen schicken, kannst Du das hier tun."
                                isRequired
                            >
                                <Input placeholder="max.muster@muster.de" />
                            </Field>
                            <Field
                                label="Maximale Entfernung zum Impfort in Kilometern (km)"
                                name="distance"
                                isRequired
                            >
                                <Select values={Object.keys(distances)} placeholder="Bitte wählen..." />
                            </Field>
                            <Field label="Barrierefreier Impfort gewünscht" labelHidden name="accessible">
                                <Toggle label="Barrierefreier Impfort gewünscht" />
                            </Field>
                        </div>
                    </div>
                    <div className="flex justify-end px-4 py-4 sm:px-6">
                        <Button scheme="brandUser" type="submit">
                            Postleitzahl prüfen
                        </Button>
                    </div>
                </div>
            </Form>
        </>
    );
};
