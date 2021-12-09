import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { withActions } from 'components';
import {
    Button,
    Message,
    Modal,
    ModalHeader,
    ModalContent,
    ModalFooter,
    Link,
    Title,
} from 'ui';
import { cancelAppointment, openAppointments } from 'apps/provider/actions';
import { PropertyTags } from './PropertyTags';
import { getHexId } from 'helpers/conversion';

const AppointmentOverviewBase: React.FC<any> = ({
    openAppointmentsAction,
    cancelAppointmentAction,
    appointment,
    action,
    onClose,
    ...props
}) => {
    const [showDelete, setShowDelete] = useState(false);
    const acceptedItems = appointment.bookings.map((booking: any) => (
        <li className="kip-is-code" key={booking.id}>
            {booking.data.tokenData.code}
        </li>
    ));

    const doDelete = () => {
        cancelAppointmentAction(appointment).then(() => {
            // we reload the appointments
            openAppointmentsAction();
            onClose();
        });
    };

    const hexId = getHexId(appointment.id);

    if (showDelete) {
        return (
            <Modal onClose={() => setShowDelete(false)} {...props}>
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
                    <Button onClick={doDelete} variant="danger">
                        <Trans id="appointment-overview.delete.confirm">
                            Löschen bestätigen
                        </Trans>
                    </Button>

                    <Button onClick={() => setShowDelete(false)}>
                        <Trans id="appointment-overview.delete.cancel">
                            Abbrechen
                        </Trans>
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    return (
        <Modal
            onClose={onClose}
            {...props}
            className="kip-appointment-overview"
        >
            <ModalHeader className="flex justify-between">
                <Title>
                    <Trans id="appointment-overview.title">
                        Terminübersicht
                    </Trans>
                </Title>
                <Button
                    variant="info"
                    aria-label="Close modal"
                    className="bulma-delete"
                    data-test-id="modal-close"
                    onClick={onClose}
                >
                    X
                </Button>
            </ModalHeader>
            <ModalContent>
                <ul className="kip-appointment-details">
                    <li>
                        {new Date(appointment.timestamp).toLocaleDateString()}{' '}
                        {new Date(appointment.timestamp).toLocaleTimeString()}
                    </li>
                    <li>
                        <Trans id="appointment-overview.details.slots">
                            Slots
                        </Trans>
                        : {appointment.slotData.length}{' '}
                    </li>
                    <li>
                        <Trans id="appointment-overview.details.booked">
                            Gebucht
                        </Trans>
                        : {appointment.bookings.length}{' '}
                    </li>
                </ul>

                <PropertyTags verbose appointment={appointment} />

                {(acceptedItems.length > 0 && (
                    <>
                        <h3>
                            <Trans id="appointment-overview.details.booking-codes">
                                Buchungscodes
                            </Trans>
                        </h3>
                        <ul className="kip-booking-codes">{acceptedItems}</ul>
                    </>
                )) || (
                    <Message variant="info">
                        <Trans id="appointment-overview.details.no-booked-slots">
                            Keine gebuchten Slots bisher. Sobald Buchungen
                            vorhanden sind werden hier die Buchungscodes
                            angezeigt.
                        </Trans>
                    </Message>
                )}
            </ModalContent>
            <ModalFooter className="flex flex-row justify-between">
                <Link
                    type="button"
                    variant="success"
                    href={`/provider/schedule/${action}/edit/${hexId}`}
                >
                    <Trans id="appointment-overview.edit.button">
                        Bearbeiten
                    </Trans>
                </Link>

                <Button variant="danger" onClick={() => setShowDelete(true)}>
                    <Trans id="appointment-overview.delete.button">
                        Termin löschen
                    </Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export const AppointmentOverview = withActions(AppointmentOverviewBase, [
    cancelAppointment,
    openAppointments,
]);
