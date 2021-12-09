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
import { withActions } from 'components';
import { cancelAppointment, openAppointments } from 'apps/provider/actions';

const DeleteAppointmentModalBase: React.FC<any> = ({
    openAppointmentsAction,
    cancelAppointmentAction,
    appointment,
    onClose,
    ...props
}) => {
    const doDelete = () => {
        cancelAppointmentAction(appointment).then(() => {
            // we reload the appointments
            openAppointmentsAction();
            onClose();
        });
    };

    return (
        <Modal onClose={onClose} {...props}>
            <ModalHeader>
                <Title>
                    <Trans id="appointment-overview.delete.title">
                        Termin löschen
                    </Trans>
                </Title>
            </ModalHeader>

            <ModalContent>
                <p>
                    <Trans id="appointment-overview.delete.notice">
                        Wollen Sie diesen Termin wirklich löschen?
                    </Trans>
                </p>
            </ModalContent>

            <ModalFooter className="flex flex-row justify-between">
                <Button variant="danger" onClick={doDelete}>
                    <Trans id="appointment-overview.delete.confirm">
                        Löschen bestätigen
                    </Trans>
                </Button>

                <Button onClick={onClose}>
                    <Trans id="appointment-overview.delete.cancel">
                        Abbrechen
                    </Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export const DeleteAppointmentModal = withActions(DeleteAppointmentModalBase, [
    openAppointments,
    cancelAppointment,
]);
