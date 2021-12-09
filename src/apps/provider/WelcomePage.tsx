// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { t, Trans } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce, useSearchParam } from 'react-use';
import { withActions } from 'components';
import {
    Divider,
    PageHeader,
    Section,
    Title,
    Text,
    Message,
    BoxContent,
    Box,
    BoxFooter,
    Link,
} from 'ui';
import { providerData } from 'apps/provider/actions';
import { RestoreForm } from './RestoreForm';
import { useServiceName } from 'hooks';

const WelcomePage: React.FC<any> = ({ providerDataAction }) => {
    const navigate = useNavigate();

    const notice = useSearchParam('notice');

    useEffectOnce(() => {
        providerDataAction().then((pd: any) => {
            if (pd?.data?.submittedAt !== undefined)
                navigate('/provider/schedule');
        });
    });

    return (
        <>
            {notice === 'thankyou' && (
                <Message variant="success">
                    <Trans id="logged-out.notice">
                        Sie wurden erfolgreich abgemeldet. Sie können Ihre Daten
                        jederzeit mit Ihrem Datenschlüssel und Ihrer
                        Sicherheitsdatei wiederherstellen.
                    </Trans>
                </Message>
            )}

            <PageHeader
                title={t({
                    id: 'provider.welcome-header.title',
                    message: 'Portal für Impfstellen',
                })}
                subTitle={t({
                    id: 'provider.welcome-header.subtitle',
                    message: 'Impfterm.in',
                })}
                text={t({
                    id: 'provider.welcome-header.text',
                    message:
                        'Kurzer, einleitender Text. Dies, das, Dinge... Vorteile eines einheitlichen Impfportals zur Vermittlung aller Impfmöglichkeiten...',
                })}
            />

            <Section className="mt-10 w-full sm:mt-0 md:grid md:grid-cols-3 md:gap-12">
                <div className="px-4 sm:px-0 md:col-span-1">
                    <Title className="text-2xl font-bold leading-relaxed text-gray-900">
                        Als neue Impfstelle registrieren
                    </Title>

                    <Text className="mt-3 text-gray-600">
                        I over slept, look I need your help. I have to ask
                        Lorraine out but I don’t know how to do it. I have to
                        ask Lorraine out but I don’t know how to do it. George.
                        George.
                    </Text>
                </div>

                <Box as="div" className="mt-5 w-full md:col-span-2 md:mt-0">
                    <BoxContent>
                        <Text className="mt-3 text-gray-600">
                            I over slept, look I need your help. I have to ask
                            Lorraine out but I don’t know how to do it. I have
                            to ask Lorraine out but I don’t know how to do it.
                            George. George.
                        </Text>
                    </BoxContent>
                    <BoxFooter>
                        <Link
                            type="button"
                            variant="success"
                            href="/provider/setup"
                        >
                            Registrierung starten
                        </Link>
                    </BoxFooter>
                </Box>
            </Section>

            <Divider />

            <Section className="mt-10 w-full sm:mt-0 md:grid md:grid-cols-3 md:gap-12">
                <div className="px-4 sm:px-0 md:col-span-1">
                    <Title className="text-2xl font-bold leading-relaxed text-gray-900">
                        Mit bestehendem Account einloggen
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

export default withActions(WelcomePage, [providerData]);
