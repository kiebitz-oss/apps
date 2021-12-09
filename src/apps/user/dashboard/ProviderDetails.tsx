import React from 'react';
import { Trans } from '@lingui/macro';
import { Message } from 'ui';
import { Provider } from 'types';

interface ProviderDetailsProps {
    provider: Provider;
}

export const ProviderDetails: React.FC<ProviderDetailsProps> = ({
    provider,
}) => {
    return (
        <address className="mb-4">
            <strong>{provider.name}</strong>
            <br />
            {provider.street}
            <br />
            {provider.zipCode} {provider.city}
            <br />
            {provider.accessible && (
                <>
                    <Trans id="provider-details.accessible">
                        (barrierefreier Zugang)
                    </Trans>
                    <br />
                </>
            )}
            {provider.description && (
                <Message variant="info">{provider.description}</Message>
            )}
        </address>
    );
};
