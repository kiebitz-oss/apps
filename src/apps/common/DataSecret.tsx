import React from 'react';
import { Trans } from '@lingui/macro';
import { SecretsBox } from './SecretBox';
import { CopyToClipboardButton } from 'ui';

interface DataSecretProps {
    secret: string;
    embedded?: boolean;
    hideNotice?: boolean;
}

export const DataSecret: React.FC<DataSecretProps> = ({ secret, embedded }) => {
    return (
        <>
            {!embedded && (
                <p className="kip-secrets-notice">
                    <Trans id="store-secrets.online.text">
                        Bitte notieren Sie Ihren Datenschlüssel sorgfältig! Sie
                        benötigen ihn, um sich auf einem anderen PC (Tablet,
                        Smartphone etc.) einzuloggen oder auf einem anderen
                        Endgerät auf Ihre Termine zugreifen zu können.
                    </Trans>
                </p>
            )}

            <SecretsBox secret={secret} />

            {!embedded && (
                <div className="kip-secrets-links">
                    <CopyToClipboardButton toCopy={secret}>
                        <Trans id="store-secrets.copy">Kopieren</Trans>
                    </CopyToClipboardButton>
                </div>
            )}
        </>
    );
};
