import React from 'react';
import { Trans } from '@lingui/macro';
import {
    Modal,
    Button,
    ModalHeader,
    ModalContent,
    ModalFooter,
    Title,
} from 'ui';
import {
    acceptedInvitation,
    cancelInvitation,
    invitation,
    tokenData,
} from 'apps/user/actions';
import { withActions } from 'components';

const CancelAppointmentModalBase: React.FC<any> = ({
    onClose,
    tokenData,
    acceptedInvitation,
    acceptedInvitationAction,
    invitationAction,
    cancelInvitationAction,
}) => {
    const doDelete = () => {
        onClose();
        cancelInvitationAction(acceptedInvitation.data, tokenData.data).then(
            () => {
                // we reload the appointments
                invitationAction();
                acceptedInvitationAction();
            }
        );
    };

    return (
        <Modal onClose={onClose}>
            <ModalHeader>
                <Title>
                    <Trans id="invitation-accepted.delete.title">
                        Termin absagen
                    </Trans>
                </Title>
            </ModalHeader>

            <ModalContent>
                <p>
                    <Trans id="invitation-accepted.delete.notice">
                        Willst du den Termin wirklich absagen?
                    </Trans>
                </p>
            </ModalContent>

            <ModalFooter className="flex gap-4">
                <Button onClick={doDelete} variant="danger">
                    <Trans id="invitation-accepted.delete.confirm">
                        Bestätigen
                    </Trans>
                </Button>
                <Button onClick={onClose} variant="secondary">
                    <Trans id="invitation-accepted.delete.cancel">
                        Abbrechen
                    </Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export const CancelAppointmentModal = withActions(CancelAppointmentModalBase, [
    acceptedInvitation,
    cancelInvitation,
    invitation,
    tokenData,
]);
