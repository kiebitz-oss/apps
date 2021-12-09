import React from 'react';
import { Trans, defineMessage } from '@lingui/macro';
import { Link } from 'ui';
import { urlEncode } from 'helpers/data';
import { formatDate, getMonday } from 'helpers/time';
import { useParams } from 'react-router';
import { AppointmentBox } from './AppointmentBox';
import { Appointment } from 'types';
import clsx from 'clsx';

const dayMessages = {
    [0]: defineMessage({ id: 'day-1', message: 'Montag' }),
    [1]: defineMessage({ id: 'day-2', message: 'Dienstag' }),
    [2]: defineMessage({ id: 'day-3', message: 'Mittwoch' }),
    [3]: defineMessage({ id: 'day-4', message: 'Donnerstag' }),
    [4]: defineMessage({ id: 'day-5', message: 'Freitag' }),
    [5]: defineMessage({ id: 'day-6', message: 'Samstag' }),
    [6]: defineMessage({ id: 'day-7', message: 'Sonntag' }),
};

interface CalendarAppointmentsProps {
    appointments: Appointment[];
    action: string;
    ots: any;
}

export const CalendarAppointments: React.FC<CalendarAppointmentsProps> = ({
    appointments,
    action,
    ots,
}) => {
    const appointmentsItems = appointments
        .filter((ap) => ap.startsHere && ap.appointment.slots > 0)
        .map(({ appointment }) => (
            <AppointmentBox key={appointment.id} appointment={appointment} />
        ));

    return (
        <Link
            href={`/provider/schedule/${action}/new#${urlEncode({
                timestamp: ots.toISOString(),
            })}`}
            className={clsx('kip-hour-row', 'kip-has-appointments')}
        >
            <div className="kip-appointments">{appointmentsItems}</div>
        </Link>
    );
};

const HourRow: React.FC<any> = ({ appointments, date, day, hour }) => {
    const { action, secondaryAction, id } = useParams();

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
        if (oae > ots && oae <= ote) {
            relevant = true;
        }

        // is in interval
        if (oas <= ots && oae >= ote) {
            relevant = true;
        }

        if (relevant)
            relevantAppointments.push({
                startsHere: startsHere,
                appointment: oa,
            });
    }

    const hasAppointments = relevantAppointments.length > 0;

    return hasAppointments ? (
        <CalendarAppointments
            ots={ots}
            ote={ote}
            id={id}
            action={action}
            secondaryAction={secondaryAction}
            appointments={relevantAppointments}
        />
    ) : (
        <Link
            href={`/provider/schedule/${action}/new#${urlEncode({
                timestamp: ots.toISOString(),
            })}`}
            className={'kip-hour-row'}
        ></Link>
    );
};

const HourLabelRow: React.FC<{ hour: any }> = ({ hour }) => {
    return (
        <div className="kip-hour-row kip-is-hour-label">
            {hour !== '-' && (
                <>
                    {hour.toLocaleString('en-US', { minimumIntegerDigits: 2 })}{' '}
                    -{' '}
                    {(hour + 1).toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                    })}
                </>
            )}
        </div>
    );
};

const DayLabelRow: React.FC<any> = ({ day, date }) => {
    return (
        <div className="kip-hour-row kip-is-day-label">
            <span className="kip-day">
                <Trans id={dayMessages[day].id} />
            </span>

            <span className="kip-date">{date.toLocaleDateString()}</span>
        </div>
    );
};

const DayColumn: React.FC<any> = ({
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

const DayLabelColumn: React.FC<any> = ({ fromHour, toHour }) => {
    const hourRows = [<HourLabelRow hour="-" key="-" />];

    for (let i = fromHour; i <= toHour; i++) {
        hourRows.push(<HourLabelRow hour={i} key={i} />);
    }

    return <div className="kip-day-column kip-is-day-label">{hourRows}</div>;
};

export const WeekCalendar: React.FC<any> = ({ startDate, appointments }) => {
    let fromHour: number | undefined;
    let toHour: number | undefined;

    const { action, secondaryAction, id } = useParams();

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    appointments.forEach((app: any) => {
        const appStartDate = new Date(app.timestamp);
        const appEndDate = new Date(
            new Date(app.timestamp).getTime() + 1000 * 60 * app.duration
        );

        if (
            appStartDate < startDate ||
            appStartDate > endDate ||
            app.slots === 0
        ) {
            return;
        }

        const startHours = appStartDate.getHours();
        const endHours = appEndDate.getHours();

        if (fromHour === undefined || startHours < fromHour) {
            fromHour = startHours;
        }

        if (toHour === undefined || endHours > toHour) {
            toHour = endHours;
        }
    });

    if (fromHour === undefined || fromHour > 8) {
        fromHour = 8;
    }

    if (toHour === undefined || toHour < 19) {
        toHour = 19; // hours are inclusive
    }

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

    const forwardDate = formatDate(
        getMonday(new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 7))
    );

    const backwardDate = formatDate(
        getMonday(new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 7))
    );

    return (
        <>
            <div className="flex justify-between">
                <Link
                    type="button"
                    href={`/provider/schedule/${forwardDate}`}
                    variant="secondary"
                    size="sm"
                >
                    <Trans id="schedule.backward">vorherige Woche</Trans>
                </Link>

                <Link
                    type="button"
                    href={`/provider/schedule/${backwardDate}`}
                    variant="secondary"
                    size="sm"
                >
                    <Trans id="schedule.forward">nächste Woche</Trans>
                </Link>
            </div>

            <div className="kip-week-calendar">{dayColumns}</div>
        </>
    );
};
