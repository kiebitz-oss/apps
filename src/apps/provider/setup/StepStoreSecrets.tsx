// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    Modal,
    BoxContent,
    BoxFooter,
    Button,
    ModalHeader,
    ModalContent,
    ModalFooter,
    Box,
    BoxHeader,
    Title,
} from 'ui';
import { withActions } from 'components';
import { providerSecret } from 'apps/provider/actions';
import { Trans } from '@lingui/macro';
import { useNavigate, useParams } from 'react-router-dom';
import { BackupDataLink } from 'apps/provider/common/BackupDataLink';
import { DataSecret } from 'apps/common/DataSecret';

const StepStoreSecretsBase: React.FC<any> = ({ providerSecret }) => {
    const navigate = useNavigate();
    const { status } = useParams();

    const goToDashboard = () => {
        navigate('/provider');
    };

    const showSecrets = () => {
        navigate('/provider/setup/store-secrets/show');
    };

    const hideSecrets = () => {
        navigate('/provider/setup/store-secrets');
    };

    return (
        <Box>
            <BoxHeader>
                <Title>Missing title</Title>
            </BoxHeader>

            <BoxContent>
                <p>
                    <Trans id="store-secrets.notice">
                        Um sich auf einem anderen PC (Tablet, Smartphone etc.)
                        einzuloggen oder auf einem anderen Endgerät auf Ihre
                        Termine zugreifen zu können, benötigen Sie Ihre
                        Sicherungsdatei und Ihren Datenschlüssel. Bitte
                        erstellen Sie jetzt Ihre Sicherungsdatei und notieren
                        Sie sich im Anschluss den Datenschlüssel.
                    </Trans>
                </p>
            </BoxContent>

            <BoxFooter>
                <BackupDataLink onSuccess={showSecrets} />
            </BoxFooter>

            {status === 'show' && (
                <Modal onClose={hideSecrets}>
                    <ModalHeader>
                        <Trans id="store-secrets.secrets-modal.title">
                            Bitte Datenschlüssel notieren!
                        </Trans>
                    </ModalHeader>

                    <ModalContent>
                        <DataSecret secret={providerSecret.data} />
                    </ModalContent>

                    <ModalFooter>
                        <Button onClick={goToDashboard}>
                            <Trans id="wizard.leave">
                                Abschließen & zur Terminplanung
                            </Trans>
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </Box>
    );
};

export const StepStoreSecrets = Object.assign(
    withActions(StepStoreSecretsBase, [providerSecret]),
    { step: 'store-secrets' }
);
