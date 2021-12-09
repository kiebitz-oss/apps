import React from 'react';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router';
import {
    Modal,
    Button,
    ModalHeader,
    ModalContent,
    ModalFooter,
    CopyToClipboardButton,
    Title,
} from 'ui';
import { withActions } from 'components';
import { BackupDataLink } from 'apps/provider/common/BackupDataLink';
import { SecretsBox } from 'apps/common/SecretBox';
import { providerSecret } from 'apps/provider/actions';

const BackupModalBase: React.FC<any> = ({ providerSecret }) => {
    const navigate = useNavigate();

    const cancel = () => {
        navigate('/provider/settings');
    };

    return (
        <Modal>
            <ModalHeader>
                <Title>
                    <Trans id="backup-modal.title">
                        Datenbackup anfertigen
                    </Trans>
                </Title>
            </ModalHeader>

            <ModalContent>
                <p>
                    <Trans id="backup-modal.text">
                        Klicken Sie auf "Datenbackup anfertigen" um eine
                        verschlüsselte Datei mit Ihren Einstellungen und
                        Termindaten zu erzeugen. Bitte denken Sie daran, den
                        Datenschlüssel zu notieren, ohne diesen sind die Daten
                        nicht wiederherstellbar.
                    </Trans>
                </p>

                <SecretsBox secret={providerSecret.data} />

                <div className="flex flex-row justify-between">
                    <CopyToClipboardButton toCopy={providerSecret.data}>
                        Datenschlüssel kopieren
                    </CopyToClipboardButton>

                    <BackupDataLink
                        downloadText={
                            <Trans id="backup-modal.download-backup">
                                Sicherungsdatei herunterladen
                            </Trans>
                        }
                        onSuccess={cancel}
                    />
                </div>
            </ModalContent>

            <ModalFooter>
                <Button onClick={cancel}>
                    <Trans id="backup-modal.close">Schließen</Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export const BackupModal = withActions(BackupModalBase, [providerSecret]);
