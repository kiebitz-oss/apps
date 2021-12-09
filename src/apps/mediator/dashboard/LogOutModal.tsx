import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/macro';
import { useBackend } from 'hooks';
import { Modal, Button, ModalHeader, ModalContent, ModalFooter } from 'ui';

export const LogOutModal: React.FC = () => {
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const backend = useBackend();

    const cancel = () => {
        navigate('/mediator/settings');
    };

    const logOut = () => {
        setLoggingOut(true);

        backend.local.deleteAll('mediator::');
        navigate('/mediator/logged-out');
    };

    return (
        <Modal onClose={cancel}>
            <ModalHeader>
                <Trans id="log-out-modal.title">Abmelden</Trans>
            </ModalHeader>

            <ModalContent>
                <p>
                    {loggingOut ? (
                        <Trans id="log-out-modal.logging-out">
                            log-out-modal.logging-out MISSING
                        </Trans>
                    ) : (
                        <Trans id="log-out-modal.text">
                            log-out-modal.text MISSING
                        </Trans>
                    )}
                </p>
            </ModalContent>
            <ModalFooter>
                <Button onClick={logOut} disabled={loggingOut}>
                    <Trans id="log-out">Abmelden</Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};
