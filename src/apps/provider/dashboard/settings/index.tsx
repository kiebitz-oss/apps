// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { Trans, t } from '@lingui/macro';
import { useEffectOnce } from 'react-use';
import { useParams } from 'react-router';
import {
    DropdownMenu,
    DropdownMenuItem,
    BoxFooter,
    BoxContent,
    Link,
    Title,
} from 'ui';
import { withActions, WithLoader } from 'components';
import {
    keys,
    keyPairs,
    backupData,
    providerData,
    providerSecret,
    verifiedProviderData,
} from 'apps/provider/actions';
import { BackupModal } from './BackupModal';
import { ProviderDataSummary } from 'apps/provider/common/ProviderDataSummary';

const SettingsTabBase: React.FC<any> = ({
    keysAction,
    keyPairs,
    providerData,
    providerDataAction,
    verifiedProviderData,
    verifiedProviderDataAction,
}) => {
    const [view, setView] = useState('verified');
    const { action } = useParams();

    // we load all the resources we need
    useEffectOnce(() => {
        keysAction();
        verifiedProviderDataAction();
        providerDataAction();
    });

    const render = () => {
        return (
            <>
                <BoxContent>
                    <Title>
                        <Trans id="provider-data.title">Ihre Daten</Trans>
                    </Title>

                    <p>
                        <Trans id="provider-data.verified-vs-unverifired-desc">
                            Ihre Daten unterlaufen einer Überprüfung
                            unsererseits. Sobald Ihre Daten überprüft wurden,
                            werden Sie Impfwilligen angezeigt. Führen Sie nach
                            der Überprüfung Ihrer Daten noch Änderungen dieser
                            durch, so müssen diese erneut Überprüft werden und
                            werden entsprechend erst nach erfolgreicher
                            Überprüfung Impfwilligen angezeigt. Daher
                            differenzieren wir zwischen verifizierten und
                            unverifizierten Daten.
                        </Trans>
                    </p>

                    <DropdownMenu
                        label={
                            view
                                ? t({
                                      id: 'settings.verified',
                                      message: 'Verifizierte Daten',
                                  })
                                : t({
                                      id: 'settings.local',
                                      message: 'Unverifizierte Daten',
                                  })
                        }
                    >
                        <DropdownMenuItem
                            icon="calendar"
                            onClick={() => setView('verified')}
                        >
                            <Trans id="settings.verified">
                                Verifizierte Daten
                            </Trans>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            icon="list"
                            onClick={() => setView('local')}
                        >
                            <Trans id="settings.local">
                                Unverifizierte Daten
                            </Trans>
                        </DropdownMenuItem>
                    </DropdownMenu>

                    <ProviderDataSummary
                        providerData={
                            view === 'verified'
                                ? verifiedProviderData
                                : providerData
                        }
                        verified={view === 'verified'}
                    />
                </BoxContent>
                <BoxFooter>
                    <div className="flex justify-between">
                        <Link
                            type="button"
                            variant="success"
                            href="/provider/settings/backup"
                        >
                            <Trans id="backup">Datenbackup anfertigen</Trans>
                        </Link>
                        <Link
                            type="button"
                            variant="warning"
                            href="/provider/settings/logout"
                        >
                            <Trans id="log-out">Abmelden</Trans>
                        </Link>
                    </div>
                </BoxFooter>

                {action === 'backup' && <BackupModal />}
            </>
        );
    };

    // we wait until all resources have been loaded before we display the form
    return (
        <WithLoader
            resources={[keyPairs, providerData, verifiedProviderData]}
            renderLoaded={render}
        />
    );
};

export const SettingsTab = withActions(SettingsTabBase, [
    keys,
    providerData,
    backupData,
    keyPairs,
    verifiedProviderData,
    providerSecret,
]);
