import React from 'react';
import { Trans } from '@lingui/macro';
import { Appointment } from 'types';
import { Message } from 'ui';
import { PropertyTags } from './PropertyTags';

interface AppointmentListItemProps {
    appointment: Appointment;
}

export const AppointmentListItem: React.FC<AppointmentListItemProps> = ({
    appointment,
}) => {
    const acceptedItems = appointment.bookings
        .sort((a: any, b: any) => {
            try {
                return a.data.tokenData.code > b.data.tokenData.code ? 1 : -1;
            } catch (e) {
                return 0;
            }
        })
        .map((booking: any) => (
            <li className="kip-is-code" key={booking.id}>
                {booking.data.tokenData.code}
            </li>
        ));

    return (
        <li className="kip-appointment-item">
            <ul className="kip-appointment-details">
                <li>
                    {new Date(appointment.timestamp).toLocaleDateString()}{' '}
                    {new Date(appointment.timestamp).toLocaleTimeString()}
                </li>
                <li>
                    <Trans id="appointment-overview.details.slots">Slots</Trans>
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
                    <ul className="kip-booking-codes">{acceptedItems}</ul>
                </>
            )) || (
                <Message variant="info">
                    <Trans id="appointment-overview.details.no-booked-slots">
                        Keine gebuchten Slots bisher. Sobald Buchungen vorhanden
                        sind werden hier die Buchungscodes angezeigt.
                    </Trans>
                </Message>
            )}
        </li>
    );
};
