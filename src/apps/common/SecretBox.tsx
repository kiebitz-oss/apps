import React from 'react';
import clsx from 'clsx';
import { Trans } from '@lingui/macro';
import { Title } from 'ui';

const renderSecret = (secret: string) => {
    const chunks = secret?.match(/.{1,4}/g) || [];
    const fragments: React.ReactNode[] = [];

    for (let i = 0; i < chunks.length; i++) {
        fragments.push(
            <React.Fragment key={`${i}-main`}>{chunks[i]}</React.Fragment>
        );

        if (i < chunks.length - 1)
            fragments.push(
                <strong
                    key={`${i}-dot`}
                    style={{ userSelect: 'none' }}
                    aria-hidden
                >
                    ·
                </strong>
            );
    }

    return <>{fragments}</>;
};

interface DataSecretProps {
    secret: string;
}

export const SecretsBox: React.FC<DataSecretProps> = ({ secret }) => {
    return (
        <div className={clsx('secrets-box')}>
            <Title>
                <Trans id="store-secrets.secret">
                    Dein Sicherheitscode - Bitte notieren!
                </Trans>
            </Title>

            <code>{renderSecret(secret)}</code>
        </div>
    );
};
