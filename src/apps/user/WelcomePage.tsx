// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router';
import { useEffectOnce } from 'react-use';
import { Divider, PageHeader, Section, Text, Title } from 'ui';
import { getTokenData } from './api';
import { RegisterForm } from './RegisterForm';
import { RestoreForm } from './RestoreForm';

const StartPage: React.FC = () => {
    const navigate = useNavigate();

    useEffectOnce(() => {
        const userTokenData = getTokenData();

        if (userTokenData) {
            navigate('/user/appointments');
        }
    });

    return (
        <>
            <PageHeader
                title={t({
                    id: 'user.welcome-header.title',
                    message: 'Dein Impftermin - ein Klick entfernt!',
                })}
                subTitle={t({
                    id: 'user.welcome-header.subtitle',
                    message: 'Impfterm.in',
                })}
                text={t({
                    id: 'user.welcome-header.text',
                    message:
                        'Kurzer, einleitender Text. Dies, das, Dinge... Vorteile eines einheitlichen Impfportals zur Vermittlung aller Impfmöglichkeiten...',
                })}
            />

            <Section className="mt-10 w-full sm:mt-0 md:grid md:grid-cols-3 md:gap-12">
                <div className="px-4 sm:px-0 md:col-span-1">
                    <Title className="text-2xl font-bold leading-relaxed text-gray-900">
                        Persönliche Anmeldung
                    </Title>

                    <Text className="mt-3 text-gray-600">
                        When could weathermen predict the weather, let alone the
                        future. Yeah, alright, bye-bye. What? Perfect, just
                        perfect. Can I go now, Mr. Strickland? Over there, on my
                        hope chest. I’ve never seen purple underwear before,
                        Calvin.
                    </Text>
                </div>

                <RegisterForm className="mt-5 md:col-span-2 md:mt-0" />
            </Section>

            <Divider />

            <Section className="mt-10 w-full sm:mt-0 md:grid md:grid-cols-3 md:gap-12">
                <div className="px-4 sm:px-0 md:col-span-1">
                    <Title className="text-2xl font-bold leading-relaxed text-gray-900">
                        Terminsuche aufrufen
                    </Title>

                    <Text className="mt-3 text-gray-600">
                        I over slept, look I need your help. I have to ask
                        Lorraine out but I don’t know how to do it. I have to
                        ask Lorraine out but I don’t know how to do it. George.
                        George.
                    </Text>
                </div>

                <RestoreForm className="mt-5 w-full md:col-span-2 md:mt-0" />
            </Section>
        </>
    );
};

export default StartPage;
