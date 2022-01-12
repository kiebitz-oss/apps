import React from 'react';
import { hexId } from 'helpers/conversion';

const AppointmentOverview = ({ appointment, action, onClose, ...props }) => {
    const [showDelete, setShowDelete] = useState(false);
    const acceptedItems = appointment.bookings
        .map((booking) => {
            return (
                <li className="kip-is-code" key={booking.id}>
                    {booking.data.tokenData.code}
                </li>
            );
        })
        .filter((it) => it);

    const doDelete = () => {
        cancelAppointmentAction(appointment).then(() => {
            // we reload the appointments
            openAppointmentsAction();
            onClose();
        });
    };

    const aId = hexId(appointment.id);

    if (showDelete)
        return (
            <Modal
                onSave={doDelete}
                onClose={() => setShowDelete(false)}
                onCancel={() => setShowDelete(false)}
                saveType="danger"
                save={<T t={t} k="appointment-overview.delete.confirm" />}
                cancel={<T t={t} k="appointment-overview.delete.cancel" />}
                title={<T t={t} k="appointment-overview.delete.title" />}
                {...props}
                className="kip-appointment-overview"
            >
                <p>
                    <T t={t} k="appointment-overview.delete.notice" />
                </p>
            </Modal>
        );
    return (
        <Modal
            bare
            onClose={onClose}
            {...props}
            className="kip-appointment-overview"
        >
            <Card>
                <CardHeader>
                    <T t={t} k="appointment-overview.title" />
                    <Button
                        type="info"
                        aria-label="Close modal"
                        className="bulma-delete"
                        data-test-id="modal-close"
                        onClick={onClose}
                    />
                </CardHeader>
                <CardContent>
                    <ul className="kip-appointment-details">
                        <li>
                            {new Date(
                                appointment.timestamp
                            ).toLocaleDateString()}{' '}
                            {new Date(
                                appointment.timestamp
                            ).toLocaleTimeString()}
                        </li>
                        <li>
                            <T t={t} k="appointment-overview.details.slots" />:{' '}
                            {appointment.slotData.length}{' '}
                        </li>
                        <li>
                            <T t={t} k="appointment-overview.details.booked" />:{' '}
                            {appointment.bookings.length}{' '}
                        </li>
                    </ul>
                    <hr />
                    <PropertyTags verbose appointment={appointment} />
                    {(acceptedItems.length > 0 && (
                        <>
                            <h3>
                                <T
                                    t={t}
                                    k="appointment-overview.details.booking-codes"
                                />
                            </h3>
                            <ul className="kip-booking-codes">
                                {acceptedItems}
                            </ul>
                        </>
                    )) || (
                        <Message type="info">
                            <T
                                t={t}
                                k="appointment-overview.details.no-booked-slots"
                            />
                        </Message>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        type="warning"
                        href={`/provider/schedule/${action}/edit/${aId}`}
                    >
                        <T t={t} k="appointment-overview.edit.button" />
                    </Button>
                    &nbsp;
                    <Button type="danger" onClick={() => setShowDelete(true)}>
                        <T t={t} k="appointment-overview.delete.button" />
                    </Button>
                </CardFooter>
            </Card>
        </Modal>
    );
};

export default AppointmentOverview;
