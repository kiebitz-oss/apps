import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import {
    Button,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Title,
} from 'ui';

export const LeaveModal: React.FC = () => {
    const [ask, setAsk] = useState(false);

    return (
        <Modal>
            <ModalHeader>
                <Title>
                    <Trans id="leave.title">
                        Möchten Sie diese Seite wirklich verlassen?
                    </Trans>
                </Title>
            </ModalHeader>

            <ModalContent>
                <Trans id="leave.text">
                    Es gibt ungespeicherte Änderungen auf der aktuellen Seite.
                    Wollen Sie diese wirklich verlassen?
                </Trans>
            </ModalContent>

            <ModalFooter>
                <Button>
                    <Trans id="leave.leave">Seite verlassen</Trans>
                </Button>
                <Button>
                    <Trans id="leave.cancel">Zurück</Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};
