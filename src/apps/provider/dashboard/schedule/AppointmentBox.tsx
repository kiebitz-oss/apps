import React from 'react';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';
import { getHexId } from 'helpers/conversion';
import { Appointment } from 'types';
import { AppointmentOverview } from './AppointmentOverview';
import { PropertyTags } from './PropertyTags';

type EnhancedAppointment = Appointment & {
    overlapsWith: any[];
    index: number;
};

interface AppointmentBoxProps {
    appointment: EnhancedAppointment;
}

export const AppointmentBox: React.FC<AppointmentBoxProps> = ({
    appointment,
}) => {
    const navigate = useNavigate();
    const { action, secondaryAction, id } = useParams();

    const p = Math.floor((appointment.duration / 60) * 100);
    const w = Math.floor(100 / (1 + appointment.maxOverlap));
    const y = Math.floor(
        (new Date(appointment.timestamp).getMinutes() / 60) * 100
    );
    const i = appointment.overlapsWith.filter(
        (oa: any) => oa.index < appointment.index
    ).length;
    const l = Math.floor(i * w);
    const tiny = p < 33 || w < 50;

    const close = () => navigate(`/provider/schedule/${action}`);
    const hexId = getHexId(appointment.id);

    const active = secondaryAction === 'show' && id === hexId;

    return (
        <div
            style={{
                height: `calc(${p}% - 5%)`,
                width: `calc(${w}% - 5%)`,
                top: `calc(${y}% + 2.5%)`,
                left: `calc(${l}% + 2.5%)`,
            }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!active) {
                    navigate(`/provider/schedule/${action}/show/${hexId}`);
                }
            }}
            className={clsx('appointment-card', {
                active: active,
            })}
        >
            {active && (
                <AppointmentOverview
                    onCancel={close}
                    onClose={close}
                    appointment={appointment}
                />
            )}

            {!tiny && (
                <>
                    <span className="kip-tag kip-is-open kip-is-tiny">
                        {appointment.slots}
                    </span>
                    <span className="kip-tag kip-is-booked kip-is-tiny">
                        · {appointment.bookings.length} ·
                    </span>

                    <PropertyTags appointment={appointment} tiny />
                </>
            )}
        </div>
    );
};
