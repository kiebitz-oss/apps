// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Trans } from '@lingui/macro';
import { BoxFooter, BoxContent, Link, BoxHeader, Title } from 'ui';
import { TestQueuesModal } from './TestQueuesModal';
import { LogOutModal } from './LogOutModal';
import { useParams } from 'react-router';

export const SettingsTab: React.FC = () => {
    const { action } = useParams();

    return (
        <>
            <BoxHeader>
                <Title>
                    <Trans id="test-queues.title">Queue-Datei testen</Trans>
                </Title>
            </BoxHeader>
            <BoxContent>
                <p>
                    <Trans id="test-queues.text">
                        Hier können Sie Queues-Dateien testen, die Sie mit dem
                        "kiebitz" Tool erstellt haben. Hierdurch können Sie
                        sicherstellen, dass die Dateien korrekt sind, bevor Sie
                        diese in ein Backend hochladen.
                    </Trans>
                </p>

                <Link
                    type="button"
                    variant="success"
                    href="/mediator/settings/test-queues"
                >
                    <Trans id="test-queues.button">Testen</Trans>
                </Link>
            </BoxContent>

            <BoxFooter>
                <Link
                    variant="warning"
                    type="button"
                    href="/mediator/settings/logout"
                >
                    <Trans id="log-out">Abmelden</Trans>
                </Link>
            </BoxFooter>

            {action === 'test-queues' && <TestQueuesModal />}
            {action === 'logout' && <LogOutModal />}
        </>
    );
};
