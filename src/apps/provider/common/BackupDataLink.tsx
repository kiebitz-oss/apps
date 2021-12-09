import React from 'react';
import { Trans } from '@lingui/macro';
import { useEffectOnce } from 'react-use';
import { withActions } from 'components';
import { str2ab } from 'helpers/conversion';
import { Message, Link } from 'ui';
import { useServiceName } from 'hooks';
import {
    providerSecret,
    providerData,
    backupData,
    keyPairs,
} from 'apps/provider/actions';

function padNumber(number: number, n: number) {
    const str = `${number}`;

    if (str.length < n) {
        return '0'.repeat(n - str.length) + str;
    }

    return str;
}

function formatDate(date: Date) {
    const [year, month, day, hours, minutes] = [
        date.getFullYear(),
        padNumber(date.getMonth() + 1, 2),
        padNumber(date.getDate(), 2),
        padNumber(date.getHours(), 2),
        padNumber(date.getMinutes(), 2),
    ];
    return `${year}-${month}-${day}-${hours}-${minutes}`;
}

const BackupDataLinkBase: React.FC<any> = ({
    onSuccess,
    downloadText,
    providerData,
    keyPairsAction,
    providerSecretAction,
    backupData,
    backupDataAction,
}) => {
    let providerName;

    try {
        providerName = providerData.data.data.name
            .replaceAll(' ', '-')
            .replaceAll('.', '-')
            .toLowerCase();
    } catch (e) {}

    useEffectOnce(() => {
        keyPairsAction().then((kp: any) =>
            providerSecretAction().then((ps: any) =>
                backupDataAction(kp.data, ps.data)
            )
        );
    });

    let blob;

    if (backupData?.status === 'succeeded') {
        blob = new Blob([str2ab(JSON.stringify(backupData.data))], {
            type: 'application/octet-stream',
        });
    }

    const title = useServiceName().toLowerCase();

    const dateString = formatDate(new Date());

    const filename = `${title}-backup-${dateString}-${providerName}.enc`;

    if (blob !== undefined) {
        return (
            <a
                onClick={onSuccess}
                className="button success md"
                download={filename}
                href={URL.createObjectURL(blob)}
            >
                {downloadText || (
                    <Trans id="wizard.download-backup-data">
                        Sicherungsdatei herunterladen und Datenschlüssel
                        notieren
                    </Trans>
                )}
            </a>
        );
    }

    return (
        <Message waiting variant="warning">
            <Trans id="wizard.generating-backup-data">
                Bitte warten, erstelle Backup-Daten...
            </Trans>
        </Message>
    );
};

export const BackupDataLink = withActions(BackupDataLinkBase, [
    providerSecret,
    backupData,
    keyPairs,
    providerData,
]);
