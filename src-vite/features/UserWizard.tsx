import React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Toggle } from '@/components/Toggle';
import { Field } from '@/components/Field';
import { Form } from '@/components/Form';
import Card from '@/components/Card';
import { getQueues } from '@/kiebitz/provider/queues';
import { getUserAppointmentsTokenDataWithSignedToken } from '@/kiebitz/user/queue';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';
import useURLHash from '@/hooks/useURLHash';
import useUserAppointmentsShortcut from '@/hooks/useUserAppointmentsShortcut';
const distances = { '5 Km': 5, '10 Km': 10, '20 Km': 20, '30 Km': 30, '40 Km': 40, '50 Km': 50 };
const plzRegex = /^[0-9]{5}$/;

type FormSubmitData = {
    code: string;
    zip: string;
    distance: string;
    email: string;
    accessible: boolean;
};

const UserWizard = () => {
    const [userSecret] = useUserSecret();
    const [userTokenData] = useUserTokenData();

    useUserAppointmentsShortcut(userSecret, userTokenData);

    const hash = useURLHash();
    const hashParams = hash ? new URLSearchParams(hash.replace('#', '')) : undefined;

    console.log(userSecret, userTokenData);

    const history = useHistory();

    const handleSubmit = async (data: FormSubmitData) => {
        const { zip, distance } = data;
        const queues = await getQueues({ zipCode: zip, radius: Number.parseInt(distance, 10) });

        console.log('getQueues', { queues });
        if (queues.length <= 0) {
            console.log('No queues to submit to.');
            return;
        }

        const { email, code, accessible } = data;

        const tokenData = await getUserAppointmentsTokenDataWithSignedToken(
            { email, code },
            { zipCode: zip, distance: Number.parseInt(distance, 10), accessible },
            queues[0],
            userSecret
        );

        if (tokenData) {
            history.push('/user/appointments');
        }
    };

    console.log(userSecret);

    const hasDefaultValues = hashParams?.has('email') && hashParams?.has('zipCode') && hashParams?.has('code');

    return (
        <div className="container mx-auto min-h-screen 2xl:pt-24 py-12 2xl:w-1/4 lg:w-1/2">
            <Card className="lg:rounded-lg">
                <h1 className="text-4xl text-brand-user">Willkommen</h1>
                <p>Hier kannst Du Dich mit wenigen Angaben für freie Impftermine in Deiner Nähe registrieren.</p>
                <Form
                    key={hash}
                    onSubmit={handleSubmit}
                    defaultValues={{
                        email: hashParams?.get('email'),
                        zip: hashParams?.get('zipCode'),
                        code: hashParams?.get('code'),
                        distance: hasDefaultValues ? '50 Km' : undefined,
                    }}
                >
                    <div className="py-5">
                        <div className="space-y-4">
                            <Field label="Postleitzahl deines Wohnorts" name="zip" pattern={plzRegex} isRequired>
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
                                label="Zugangscode aus deiner E-Mail"
                                name="code"
                                hint="Der in Deiner Anmelde-E-Mail enthaltene Zugangscode (dieser sollte bereits ausgefüllt sein)."
                                isRequired
                            >
                                <Input placeholder="fb892bcc42124679dd4e2aeb935b1c99" />
                            </Field>

                            <Field
                                label="Maximale Entfernung zum Impfort in Kilometern (Km)"
                                name="distance"
                                isRequired
                            >
                                <Select values={Object.keys(distances)} placeholder="Bitte wählen ..." />
                            </Field>
                            <Field label="Barrierefreier Impfort gewünscht" labelHidden name="accessible">
                                <Toggle label="Barrierefreier Impfort gewünscht" />
                            </Field>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button scheme="user" type="submit">
                            Postleitzahl prüfen
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default UserWizard;
