import React from 'react';
import PropertyTags from './property-tags';

const AppointmentItem = ({ appointment }) => {
    const acceptedItems = appointment.bookings
        .sort((a, b) => {
            try {
                if (a.data.tokenData.code > b.data.tokenData.code) return 1;
                else return -1;
            } catch (e) {
                return 0;
            }
        })
        .map((booking) => {
            return (
                <li className="kip-is-code" key={booking.id}>
                    {booking.data.tokenData.code}
                </li>
            );
        })
        .filter((it) => it);

    return (
        <li className="kip-appointment-item">
            <ul className="kip-appointment-details">
                <li>
                    {new Date(appointment.timestamp).toLocaleDateString()}{' '}
                    {new Date(appointment.timestamp).toLocaleTimeString()}
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
            <PropertyTags verbose appointment={appointment} />
            {(acceptedItems.length > 0 && (
                <>
                    <ul className="kip-booking-codes">{acceptedItems}</ul>
                </>
            )) || (
                <Message type="info">
                    <T t={t} k="appointment-overview.details.no-booked-slots" />
                </Message>
            )}
        </li>
    );
};

const AppointmentsList = ({ appointments }) => {
    const appointmentItems = appointments
        .filter((app) => app.bookings.length > 0)
        .map((appointment) => (
            <AppointmentItem key={appointment.id} appointment={appointment} />
        ));
    return (
        <div className="kip-appointments-list kip-printable">
            <h2>
                <T t={t} k="appointments-list.title" />
            </h2>
            <ul className="kip-appointments">{appointmentItems}</ul>
        </div>
    );
};

export default AppointmentsList;
