import React, { MouseEventHandler, useState } from 'react';
import { t, Trans } from '@lingui/macro';
import { withActions } from 'components';
import {
    Box,
    Button,
    BoxHeader,
    BoxContent,
    BoxFooter,
    Title,
    CopyToClipboardButton,
} from 'ui';
import {
    backupData,
    keyPairs,
    providerData,
    providerSecret,
    verifiedProviderData,
} from 'apps/provider/actions';
import { BackupDataLink } from 'apps/provider/common/BackupDataLink';
import { useNavigate } from 'react-router';
import { SecretsBox } from 'apps/common/SecretBox';
import { useBackend } from 'hooks';

export const LogOutPageBase: React.FC<any> = ({
    keyPairsAction,
    providerSecret,
    providerSecretAction,
    backupDataAction,
}) => {
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const backend = useBackend();

    const logOut: MouseEventHandler<HTMLButtonElement> = async () => {
        setLoggingOut(true);

        const kpa = keyPairsAction('logoutKeyPairs');

        kpa.then((kp: any) => {
            const psa = providerSecretAction(undefined, 'logoutProviderSecret');

            psa.then((ps: any) => {
                // we give the backup data action a different name to avoid it being rejected
                // in case there's already a backup in progress... It will still be queued
                // up to ensure no conflicts can occur.
                const ba = backupDataAction(kp.data, ps.data, 'logout');

                ba.then(() => {
                    backend.local.deleteAll('provider::');
                    navigate('/provider?notice=thankyou');
                });

                ba.catch(() => setLoggingOut(false));
            });

            psa.catch(() => setLoggingOut(false));
        });

        kpa.catch(() => setLoggingOut(false));
    };

    return (
        <Box>
            <BoxHeader>
                <Title>
                    <Trans id="log-out-Box.title">Abmelden</Trans>
                </Title>
            </BoxHeader>

            <BoxContent>
                <p>
                    {loggingOut ? (
                        <Trans id="log-out-Box.logging-out">
                            Bitte warten, Sie werden abgemeldet...
                        </Trans>
                    ) : (
                        <Trans id="log-out-Box.text">
                            Möchten Sie sich wirklich abmelden? Bitte stellen
                            Sie sicher, dass Sie Ihren Datenschlüssel notiert
                            und Ihre Sicherungsdatei heruntergeladen haben . Nur
                            damit können Sie sich erneut einloggen.
                        </Trans>
                    )}
                </p>

                <SecretsBox secret={providerSecret.data} />

                <div className="flex flex-row justify-between">
                    <CopyToClipboardButton toCopy={providerSecret.data}>
                        Datenschlüssel kopieren
                    </CopyToClipboardButton>

                    <BackupDataLink
                        downloadText={t({
                            id: 'backup-Box.download-backup',
                            message: 'Sicherungsdatei herunterladen',
                        })}
                    />
                </div>
            </BoxContent>

            <BoxFooter>
                <Button onClick={logOut} disabled={loggingOut}>
                    <Trans id="log-out">Abmelden</Trans>
                </Button>
            </BoxFooter>
        </Box>
    );
};

export default withActions(LogOutPageBase, [
    providerData,
    backupData,
    keyPairs,
    verifiedProviderData,
    providerSecret,
]);
