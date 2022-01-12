import React from 'react';
import { useRouter } from 'hooks';
import { urlEncode } from 'helpers/data';
import { Button, T } from 'components';
import t from './translations.yml';

const CalendarAppointments = ({
    action,
    secondaryAction,
    id,
    appointments,
}) => {
    const [showModal, setShowModal] = useState(false);
    let modal;
    const appointmentsItems = appointments
        .filter((ap) => ap.startsHere && ap.appointment.slots > 0)
        .map(({ appointment }) => (
            <AppointmentCard
                action={action}
                secondaryAction={secondaryAction}
                id={id}
                key={appointment.id}
                appointment={appointment}
                n={appointments.length}
            />
        ));
    return (
        <>
            <div className="kip-appointments">{appointmentsItems}</div>
        </>
    );
};

const HourRow = ({
    appointments,
    action,
    secondaryAction,
    id,
    date,
    day,
    hour,
}) => {
    const ots = new Date(
        date.toLocaleDateString('en-US') +
            ' ' +
            hour.toLocaleString('en-US', { minimumIntegerDigits: 2 }) +
            ':00:00'
    );
    const ote = new Date(ots);
    ote.setHours(ote.getHours() + 1);
    const relevantAppointments = [];
    for (const oa of appointments) {
        // beginning of appointment
        const oas = new Date(`${oa.timestamp}`);
        // end of appointment
        const oae = new Date(oas.getTime() + 1000 * 60 * oa.duration);
        let startsHere = false;
        let relevant = false;
        // starts in interval
        if (oas >= ots && oas < ote) {
            startsHere = true;
            relevant = true;
        }
        // ends in interval
        if (oae > ots && oae <= ote) relevant = true;

        // is in interval
        if (oas <= ots && oae >= ote) relevant = true;

        if (relevant)
            relevantAppointments.push({
                startsHere: startsHere,
                appointment: oa,
            });
    }

    const router = useRouter();

    const showNewAppointment = () => {
        const query = urlEncode({ timestamp: ots.toISOString() });
        router.navigateToUrl(`/provider/schedule/${action}/new#${query}`);
    };

    const hasAppointments = relevantAppointments.length > 0;
    return (
        <div
            onClick={showNewAppointment}
            className={
                'kip-hour-row' +
                (hasAppointments ? ' kip-has-appointments' : '')
            }
        >
            {hasAppointments && (
                <CalendarAppointments
                    ots={ots}
                    ote={ote}
                    id={id}
                    action={action}
                    secondaryAction={secondaryAction}
                    appointments={relevantAppointments}
                />
            )}
        </div>
    );
};

const HourLabelRow = ({ hour }) => {
    let content;
    if (hour !== '-')
        content = (
            <>
                {hour.toLocaleString('en-US', { minimumIntegerDigits: 2 })} -{' '}
                {(hour + 1).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                })}
            </>
        );
    return <div className="kip-hour-row kip-is-hour-label">{content}</div>;
};

const DayLabelRow = ({ day, date }) => {
    return (
        <div className="kip-hour-row kip-is-day-label">
            <span className="kip-day">
                <T t={t} k={`day-${day + 1}`} />
            </span>
            <span className="kip-date">{date.toLocaleDateString()}</span>
        </div>
    );
};

const DayColumn = ({
    day,
    date,
    fromHour,
    toHour,
    action,
    secondaryAction,
    id,
    appointments,
}) => {
    const hourRows = [
        <DayLabelRow
            appointments={appointments}
            date={date}
            day={day}
            key="-"
        />,
    ];
    for (let i = fromHour; i <= toHour; i++) {
        hourRows.push(
            <HourRow
                appointments={appointments}
                id={id}
                action={action}
                secondaryAction={secondaryAction}
                key={i}
                hour={i}
                day={day}
                date={date}
            />
        );
    }
    return <div className="kip-day-column">{hourRows}</div>;
};

const DayLabelColumn = ({ fromHour, toHour }) => {
    const hourRows = [<HourLabelRow hour="-" key="-" />];
    for (let i = fromHour; i <= toHour; i++) {
        hourRows.push(<HourLabelRow hour={i} key={i} />);
    }
    return <div className="kip-day-column kip-is-day-label">{hourRows}</div>;
};

const WeekCalendar = ({
    action,
    secondaryAction,
    id,
    startDate,
    appointments,
}) => {
    let fromHour;
    let toHour;
    const router = useRouter();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    appointments.forEach((app) => {
        const appStartDate = new Date(app.timestamp);
        const appEndDate = new Date(
            new Date(app.timestamp).getTime() + 1000 * 60 * app.duration
        );
        if (
            appStartDate < startDate ||
            appStartDate > endDate ||
            app.slots === 0
        )
            return;
        const startHours = appStartDate.getHours();
        const endHours = appEndDate.getHours();
        if (fromHour === undefined || startHours < fromHour)
            fromHour = startHours;
        if (toHour === undefined || endHours > toHour) toHour = endHours;
    });
    if (fromHour === undefined || fromHour > 8) fromHour = 8;
    if (toHour === undefined || toHour < 19) toHour = 19; // hours are inclusive
    const dayColumns = [
        <DayLabelColumn
            fromHour={fromHour}
            toHour={toHour}
            key="-"
            appointments={appointments}
        />,
    ];
    const date = new Date(startDate);
    for (let i = 0; i < 7; i++) {
        dayColumns.push(
            <DayColumn
                appointments={appointments}
                secondaryAction={secondaryAction}
                action={action}
                id={id}
                fromHour={fromHour}
                toHour={toHour}
                date={new Date(date)}
                day={i}
                key={i}
            />
        );
        date.setDate(date.getDate() + 1);
    }

    const goBackward = () => {
        const newDate = formatDate(
            getMonday(new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 7))
        );
        router.navigateToUrl(`/provider/schedule/${newDate}`);
    };

    const goForward = () => {
        const newDate = formatDate(
            getMonday(new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 7))
        );
        router.navigateToUrl(`/provider/schedule/${newDate}`);
    };

    return (
        <>
            <div className="kip-schedule-navigation">
                <Button className="kip-backward" type="" onClick={goBackward}>
                    <T t={t} k="schedule.backward" />
                </Button>
                <Button className="kip-forward" type="" onClick={goForward}>
                    <T t={t} k="schedule.forward" />
                </Button>
            </div>
            <div className="kip-week-calendar">{dayColumns}</div>
        </>
    );
};

export default WeekCalendar;
