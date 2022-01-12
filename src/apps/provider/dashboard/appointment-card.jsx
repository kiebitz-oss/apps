import React from 'react';
import PropertyTags from './property-tags';
import { hexId } from 'helpers/conversion';

const AppointmentCard = ({ action, secondaryAction, id, appointment, n }) => {
    const router = useRouter();
    const p = Math.floor((appointment.duration / 60) * 100);
    const w = Math.floor(100 / (1 + appointment.maxOverlap));
    const y = Math.floor(
        (new Date(appointment.timestamp).getMinutes() / 60) * 100
    );
    const i = appointment.overlapsWith.filter(
        (oa) => oa.index < appointment.index
    ).length;
    const l = Math.floor(i * w);
    const tiny = p < 33 || w < 50;

    let modal;

    const close = () => router.navigateToUrl(`/provider/schedule/${action}`);
    const aId = hexId(appointment.id);

    const active = secondaryAction === 'show' && id === aId;

    if (active)
        modal = (
            <AppointmentOverview
                action={action}
                secondaryAction={secondaryAction}
                id={id}
                onCancel={close}
                onClose={close}
                appointment={appointment}
            />
        );

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
                if (!active)
                    router.navigateToUrl(
                        `/provider/schedule/${action}/show/${aId}`
                    );
            }}
            className={classNames('kip-appointment-card', {
                'kip-is-active': active,
            })}
        >
            {modal}
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

export default AppointmentCard;
