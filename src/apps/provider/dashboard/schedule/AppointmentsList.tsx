import React from 'react';
import { Trans } from '@lingui/macro';
import type { Appointment } from 'types';
import { AppointmentListItem } from './AppointmentsListItem';
import { Box, BoxContent, BoxHeader, Title } from 'ui';

interface AppointmentsListProps {
    appointments: Appointment[];
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
    appointments,
}) => {
    return (
        <>
            <BoxHeader>
                <Title>
                    <Trans id="appointments-list.title">Buchungen</Trans>
                </Title>
            </BoxHeader>

            <BoxContent>
                <ul className="kip-appointments">
                    {appointments
                        .filter(
                            (appointment) => appointment.bookings.length > 0
                        )
                        .map((appointment) => (
                            <AppointmentListItem
                                key={appointment.id}
                                appointment={appointment}
                            />
                        ))}
                </ul>
            </BoxContent>
        </>
    );
};
