// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import { withActions } from 'components';
import { Tabs, Tab, Box, BoxHeader } from 'ui';
import { keyPairs, validKeyPairs } from 'apps/mediator/actions';
import { Trans } from '@lingui/macro';
import { useParams } from 'react-router';
import { UploadKeyPairsModal } from './UploadKeyPairsModal';
import { ProvidersTab } from './ProvidersTab';
import { SettingsTab } from './SettingsTab';
import { StatsTab } from './StatsTab';

const DashboardPage: React.FC<any> = ({
    keyPairs,
    keyPairsAction,
    validKeyPairsAction,
}) => {
    const [key, setKey] = useState(false);
    const [validKey, setValidKey] = useState(false);
    const { tab } = useParams();

    useEffect(() => {
        if (!key) {
            setKey(true);
            keyPairsAction();
        }

        if (!validKey && keyPairs !== undefined) {
            setValidKey(true);
            validKeyPairsAction(keyPairs);
        }
    }, [key, validKey, keyPairs, keyPairsAction, validKeyPairsAction]);

    let content;

    if (keyPairs !== undefined) {
        switch (tab) {
            case 'settings':
                content = <SettingsTab />;
                break;

            case 'stats':
                content = <StatsTab />;
                break;

            default:
            case 'providers':
                content = <ProvidersTab />;
                break;
        }
    }

    return (
        <>
            <Box className="mt-12 mb-auto">
                <BoxHeader>
                    <Tabs>
                        <Tab
                            current={tab === 'providers'}
                            href="/mediator/providers"
                        >
                            <Trans id="providers.title">Anbieter</Trans>
                        </Tab>
                        <Tab current={tab === 'stats'} href="/mediator/stats">
                            <Trans id="stats.title">Statistiken</Trans>
                        </Tab>
                        <Tab
                            current={tab === 'settings'}
                            href="/mediator/settings"
                        >
                            <Trans id="settings.title">Einstellungen</Trans>
                        </Tab>
                    </Tabs>
                </BoxHeader>

                {content}
            </Box>

            {keyPairs?.data === null && (
                <UploadKeyPairsModal keyPairsAction={keyPairsAction} />
            )}
        </>
    );
};

export default withActions(DashboardPage, [keyPairs, validKeyPairs]);
