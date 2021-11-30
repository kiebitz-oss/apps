// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, Fragment as F } from 'react';
import { buf2hex, b642buf } from 'helpers/conversion';
import classNames from 'helpers/classnames';
import { urlEncode } from 'helpers/data';
import { formatDate, formatTime, getMonday } from 'helpers/time';
import Form from 'helpers/form';
import {
    withForm,
    withActions,
    WithLoader,
    withTimer,
    Card,
    CardHeader,
    CardContent,
    A,
    CardFooter,
    Modal,
    Label,
    DropdownMenu,
    DropdownMenuItem,
    Form as FormComponent,
    Message,
    RichSelect,
    FieldSet,
    Icon,
    RetractingLabelInput,
    ErrorFor,
    T,
    Button,
} from 'components';
import {
    keys,
    keyPairs,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    openAppointments,
} from '../actions';
import { t, Trans, defineMessage } from '@lingui/macro';
import './schedule.scss';
import { useLocation, useNavigate } from 'react-router';
import { useSettings } from 'hooks';

const dayMessages = {
    [0]: defineMessage({ id: 'day-1', message: 'Montag' }),
    [1]: defineMessage({ id: 'day-2', message: 'Dienstag' }),
    [2]: defineMessage({ id: 'day-3', message: 'Mittwoch' }),
    [3]: defineMessage({ id: 'day-4', message: 'Donnerstag' }),
    [4]: defineMessage({ id: 'day-5', message: 'Freitag' }),
    [5]: defineMessage({ id: 'day-6', message: 'Samstag' }),
    [6]: defineMessage({ id: 'day-7', message: 'Sonntag' }),
};

const scheduleMessages = {
    calendar: defineMessage({
        id: 'schedule.calendar',
        message: 'Kalenderansicht',
    }),
    'booking-list': defineMessage({
        id: 'schedule.booking-list',
        message: 'Buchungliste',
    }),
};

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
};

function getHexId(id) {
    return buf2hex(b642buf(id));
}

const AppointmentOverviewBase = ({
    openAppointmentsAction,
    cancelAppointmentAction,
    appointment,
    action,
    onClose,
    ...props
}) => {
    const [showDelete, setShowDelete] = useState(false);
    const acceptedItems = appointment.bookings
        .map(booking => {
            return (
                <li className="kip-is-code" key={booking.id}>
                    {booking.data.tokenData.code}
                </li>
            );
        })
        .filter(it => it);

    const doDelete = () => {
        cancelAppointmentAction(appointment).then(() => {
            // we reload the appointments
            openAppointmentsAction();
            onClose();
        });
    };

    const hexId = getHexId(appointment.id);

    if (showDelete)
        return (
            <Modal
                onSave={doDelete}
                onClose={() => setShowDelete(false)}
                onCancel={() => setShowDelete(false)}
                saveType="danger"
                save={
                    <Trans id="appointment-overview.delete.confirm">
                        Löschen bestätigen
                    </Trans>
                }
                cancel={
                    <Trans id="appointment-overview.delete.cancel">
                        Abbrechen
                    </Trans>
                }
                title={
                    <Trans id="appointment-overview.delete.title">
                        Termin löschen
                    </Trans>
                }
                {...props}
                className="kip-appointment-overview"
            >
                <p>
                    <Trans id="appointment-overview.delete.notice">
                        Wollen Sie diesen Termin wirklich löschen?
                    </Trans>
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
                    <Trans id="appointment-overview.title">
                        Terminübersicht
                    </Trans>
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
                    <hr />
                    <PropertyTags verbose appointment={appointment} />
                    {(acceptedItems.length > 0 && (
                        <F>
                            <h3>
                                <Trans id="appointment-overview.details.booking-codes">
                                    Buchungscodes
                                </Trans>
                            </h3>
                            <ul className="kip-booking-codes">
                                {acceptedItems}
                            </ul>
                        </F>
                    )) || (
                        <Message type="info">
                            <Trans id="appointment-overview.details.no-booked-slots">
                                Keine gebuchten Slots bisher. Sobald Buchungen
                                vorhanden sind werden hier die Buchungscodes
                                angezeigt.
                            </Trans>
                        </Message>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        type="warning"
                        href={`/provider/schedule/${action}/edit/${hexId}`}
                    >
                        <Trans id="appointment-overview.edit.button">
                            Bearbeiten
                        </Trans>
                    </Button>
                    &nbsp;
                    <Button type="danger" onClick={() => setShowDelete(true)}>
                        <Trans id="appointment-overview.delete.button">
                            Löschen bestätigen
                        </Trans>
                    </Button>
                </CardFooter>
            </Card>
        </Modal>
    );
};

const AppointmentOverview = withActions(AppointmentOverviewBase, [
    cancelAppointment,
    openAppointments,
]);

const PropertyTags = ({ appointment, verbose, tiny }) => {
    const props = Object.entries(appointment)
        .filter(([k, v]) => v === true)
        .map(([k, v]) => (
            <PropertyTag tiny={tiny} verbose={verbose} key={k} property={k} />
        ))
        .filter(p => p !== undefined);
    return <F>{props}</F>;
};

const PropertyTag = ({ property, tiny, verbose }) => {
    const settings = useSettings();
    const lang = settings.get('lang');
    const properties = settings.get('appointmentProperties');

    for (const [category, values] of Object.entries(properties)) {
        const prop = values.values[property];
        if (prop !== undefined) {
            return (
                <span
                    key={property}
                    className={classNames('kip-tag', `kip-is-${property}`, {
                        'kip-is-tiny': tiny,
                    })}
                >
                    {verbose ? prop[lang] : prop.tag[lang]}
                </span>
            );
        } else {
            return (
                <span
                    key={property}
                    className={classNames('kip-tag', `kip-is-${property}`, {
                        'kip-is-tiny': tiny,
                    })}
                >
                    {property}
                </span>
            );
        }
    }
};

const AppointmentCard = ({ action, secondaryAction, id, appointment, n }) => {
    const navigate = useNavigate();

    const p = Math.floor((appointment.duration / 60) * 100);
    const w = Math.floor(100 / (1 + appointment.maxOverlap));
    const y = Math.floor(
        (new Date(appointment.timestamp).getMinutes() / 60) * 100
    );
    const i = appointment.overlapsWith.filter(
        oa => oa.index < appointment.index
    ).length;
    const l = Math.floor(i * w);
    const tiny = p < 33 || w < 50;

    let modal;

    const close = () => navigate(`/provider/schedule/${action}`);
    const hexId = getHexId(appointment.id);

    const active = secondaryAction === 'show' && id === hexId;

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
            onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                if (!active)
                    navigate(`/provider/schedule/${action}/show/${hexId}`);
            }}
            className={classNames('kip-appointment-card', {
                'kip-is-active': active,
            })}
        >
            {modal}
            {!tiny && (
                <F>
                    <span className="kip-tag kip-is-open kip-is-tiny">
                        {appointment.slots}
                    </span>
                    <span className="kip-tag kip-is-booked kip-is-tiny">
                        · {appointment.bookings.length} ·
                    </span>
                    <PropertyTags appointment={appointment} tiny />
                </F>
            )}
        </div>
    );
};

const CalendarAppointments = ({
    action,
    secondaryAction,
    id,
    appointments,
}) => {
    const [showModal, setShowModal] = useState(false);
    let modal;
    const appointmentsItems = appointments
        .filter(ap => ap.startsHere && ap.appointment.slots > 0)
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
        <F>
            <div className="kip-appointments">{appointmentsItems}</div>
        </F>
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
    const navigate = useNavigate();

    const ots = new Date(
        date.toLocaleDateString('en-US') +
            ' ' +
            hour.toLocaleString('en-US', { minimumIntegerDigits: 2 }) +
            ':00:00'
    );
    const ote = new Date(ots);
    ote.addHours(1);
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

    const showNewAppointment = () => {
        const query = urlEncode({ timestamp: ots.toISOString() });
        navigate(`/provider/schedule/${action}/new#${query}`);
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
            <F>
                {hour.toLocaleString('en-US', { minimumIntegerDigits: 2 })} -{' '}
                {(hour + 1).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                })}
            </F>
        );
    return <div className="kip-hour-row kip-is-hour-label">{content}</div>;
};

const DayLabelRow = ({ day, date }) => {
    return (
        <div className="kip-hour-row kip-is-day-label">
            <span className="kip-day">
                <Trans id={dayMessages[day]} />
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

    const navigate = useNavigate();

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    appointments.forEach(app => {
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
        navigate(`/provider/schedule/${newDate}`);
    };

    const goForward = () => {
        const newDate = formatDate(
            getMonday(new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 7))
        );
        navigate(`/provider/schedule/${newDate}`);
    };

    return (
        <F>
            <div className="kip-schedule-navigation">
                <Button className="kip-backward" type="" onClick={goBackward}>
                    <Trans id="schedule.backward">vorherige Woche</Trans>
                </Button>
                <Button className="kip-forward" type="" onClick={goForward}>
                    <Trans id="schedule.forward">nächste Woche</Trans>
                </Button>
            </div>
            <div className="kip-week-calendar">{dayColumns}</div>
        </F>
    );
};

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
        .map(booking => {
            return (
                <li className="kip-is-code" key={booking.id}>
                    {booking.data.tokenData.code}
                </li>
            );
        })
        .filter(it => it);

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
                <F>
                    <ul className="kip-booking-codes">{acceptedItems}</ul>
                </F>
            )) || (
                <Message type="info">
                    <Trans id="appointment-overview.details.no-booked-slots">
                        Keine gebuchten Slots bisher. Sobald Buchungen vorhanden
                        sind werden hier die Buchungscodes angezeigt.
                    </Trans>
                </Message>
            )}
        </li>
    );
};

const AppointmentsList = ({ appointments }) => {
    const appointmentItems = appointments
        .filter(app => app.bookings.length > 0)
        .map(appointment => (
            <AppointmentItem key={appointment.id} appointment={appointment} />
        ));
    return (
        <div className="kip-appointments-list kip-printable">
            <h2>
                <Trans id="appointments-list.title">Buchungen</Trans>
            </h2>
            <ul className="kip-appointments">{appointmentItems}</ul>
        </div>
    );
};

class AppointmentForm extends Form {
    validate() {
        const errors = {};
        if (this.data.date === undefined)
            errors.date = t({ id: 'new-appointment.please-enter-date' });
        else if (this.data.time === undefined)
            errors.time = t({ id: 'new-appointment.please-enter-time' });
        else {
            this.data.timestamp = new Date(
                `${this.data.date} ${this.data.time}`
            );
            if (this.data.timestamp < new Date())
                errors.date = t({ id: 'new-appointment.in-the-past' });
            // we allow appointments max. 30 days in the future
            if (
                this.data.timestamp >
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30)
            )
                errors.date = t({
                    id: 'new-appointment.too-far-in-the-future',
                    message:
                        'Bitte wählen Sie Termine die maximal 30 Tage in der Zukunft liegen',
                });
        }
        if (this.data.slots > 50) {
            errors.slots = t({ id: 'new-appointment.too-many-slots' });
        }
        if (this.data.slots < 1) {
            errors.slots = t({ id: 'new-appointment.too-few-slots' });
        }
        return errors;
    }
}

const NewAppointmentBase = ({
    updateAppointment,
    createAppointment,
    appointments,
    existingAppointment,
    action,
    id,
    createAppointmentAction,
    updateAppointmentAction,
    openAppointmentsAction,
    form: { valid, error, data, set, reset },
}) => {
    let actionUrl = '';

    const navigate = useNavigate();
    const { hash } = useLocation();
    const settings = useSettings();

    if (action !== undefined) actionUrl = `/${action}`;
    if (id !== undefined) actionUrl += `/view/${id}`;
    const [initialized, setInitialized] = useState(false);
    const [saving, setSaving] = useState(false);
    const cancel = () => navigate(`/provider/schedule${actionUrl}`);

    let appointment;

    if (id !== undefined)
        appointment = appointments.find(app => getHexId(app.id) === id);

    const save = () => {
        let action;
        setSaving(true);
        // we remove unnecessary fields like 'time' and 'date'
        delete data.time;
        delete data.date;
        if (appointment !== undefined) action = updateAppointmentAction;
        else action = createAppointmentAction;
        const promise = action(data, appointment);
        promise.finally(() => setSaving(false));
        promise.then(() => {
            // we reload the appointments
            openAppointmentsAction();
            // and we go back to the schedule view
            navigate(`/provider/schedule${actionUrl}`);
        });
    };

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        if (appointment !== undefined) {
            const appointmentData = {
                time: formatTime(appointment.timestamp),
                date: formatDate(appointment.timestamp),
                slots: appointment.slots,
                duration: appointment.duration,
            };
            for (const [_, v] of Object.entries(properties)) {
                for (const [kk, _] of Object.entries(v.values)) {
                    if (appointment[kk] !== undefined)
                        appointmentData[kk] = true;
                    else delete appointmentData[kk];
                }
            }
            reset(appointmentData);
        } else {
            const newData = {
                duration: data.duration || 30,
                slots: data.slots || 1,
            };

            let firstProperty;
            let found = false;
            addProps: for (const [_, v] of Object.entries(properties)) {
                for (const [kk, _] of Object.entries(v.values)) {
                    if (firstProperty === undefined) firstProperty = kk;
                    if (data[kk] !== undefined) {
                        found = true;
                        newData[kk] = true;
                        break addProps;
                    }
                }
            }
            if (!found) newData[firstProperty] = true;

            if (hash?.timestamp !== undefined) {
                const date = new Date(hash.timestamp);
                newData.time = formatTime(date);
                newData.date = formatDate(date);
            }

            reset(newData);
        }
    });

    const properties = settings.get('appointmentProperties');

    const apptProperties = Object.entries(properties).map(([k, v]) => {
        const options = Object.entries(v.values).map(([kv, vv]) => ({
            key: vv,
            title: <Trans id={`${k}.values.${kv}`}>{v}</Trans>,
        }));

        let currentOption;

        for (const [k, v] of Object.entries(data)) {
            for (const option of options) {
                if (k === option.value && v === true) currentOption = k;
            }
        }

        const changeTo = option => {
            const newData = { ...data };
            for (const option of options) newData[option.value] = undefined;
            newData[option.value] = true;
            reset(newData);
        };

        return (
            <F key={k}>
                <h2>
                    <trans values={properties} id={`${k}.title`} />
                </h2>
                <RichSelect
                    options={options}
                    value={currentOption}
                    onChange={option => changeTo(option)}
                />
            </F>
        );
    });

    const durations = [
        5,
        10,
        15,
        20,
        30,
        45,
        60,
        90,
        120,
        150,
        180,
        210,
        240,
    ].map(duration => ({
        title: (
            <Trans id="schedule.appointment.duration.title">
                Dauer: {duration} Minuten"
            </Trans>
        ),
    }));

    return (
        <Modal
            saveDisabled={!valid || saving}
            cancelDisabled={saving}
            closeDisabled={saving}
            className="kip-new-appointment"
            onSave={save}
            waiting={saving}
            onCancel={cancel}
            onClose={cancel}
            title={
                <Trans
                    id={
                        appointment !== undefined
                            ? 'edit-appointment.title'
                            : 'new-appointment.title'
                    }
                >
                    {appointment !== undefined
                        ? 'Termin bearbeiten'
                        : 'Neuen Termin erstellen'}
                </Trans>
            }
        >
            <FormComponent>
                <FieldSet>
                    <div className="kip-field">
                        <Label htmlFor="date">
                            <Trans id="new-appointment.date">Datum</Trans>
                        </Label>
                        <ErrorFor error={error} field="date" />
                        <input
                            value={data.date || ''}
                            type="date"
                            className="bulma-input"
                            onChange={e => set('date', e.target.value)}
                        />
                    </div>
                    <div className="kip-field">
                        <Label htmlFor="time">
                            <Trans id="new-appointment.time">Uhrzeit</Trans>
                        </Label>
                        <ErrorFor error={error} field="time" />
                        <input
                            type="time"
                            className="bulma-input"
                            value={data.time || ''}
                            onChange={e => set('time', e.target.value)}
                            step={60}
                        />
                    </div>
                    <div className="kip-field kip-is-fullwidth kip-slider">
                        <Label htmlFor="slots">
                            <Trans id="new-appointment.slots">
                                Anzahl Impfdosen
                            </Trans>
                        </Label>
                        <ErrorFor error={error} field="slots" />
                        <input
                            type="number"
                            className="bulma-input"
                            value={data.slots || 1}
                            onChange={e =>
                                set('slots', parseInt(e.target.value))
                            }
                            step={1}
                            min={1}
                            max={50}
                        />
                    </div>
                    <div className="kip-field kip-is-fullwidth">
                        <RichSelect
                            id="duration"
                            value={data.duration || 30}
                            onChange={value => set('duration', value.value)}
                            options={durations}
                        />
                    </div>

                    <div className="kip-field kip-is-fullwidth">
                        {apptProperties}
                    </div>
                </FieldSet>
            </FormComponent>
        </Modal>
    );
};

const NewAppointment = withActions(
    withForm(NewAppointmentBase, AppointmentForm, 'form'),
    [createAppointment, updateAppointment, openAppointments]
);

const InvitationsPage = ({
    action,
    secondaryAction,
    id,
    keys,
    keysAction,
    lastUpdated,
    keyPairs,
    timer,
    keyPairsAction,
    invitationQueues,
    invitationQueuesAction,
    openAppointments,
    openAppointmentsAction,
}) => {
    const [initialized, setInitialized] = useState(false);
    const [view, setView] = useState('calendar');

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        // we load all the necessary data
        keyPairsAction();
        openAppointmentsAction();
        keysAction();
    });

    let startDate;

    if (action !== undefined) {
        const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(action);
        if (result) {
            const [, year, month, day] = result;
            startDate = getMonday(
                new Date(Number(year), Number(month) - 1, Number(day))
            );
        }
    }

    if (startDate === undefined) startDate = getMonday(new Date());

    if (action === undefined) {
        action = formatDate(startDate);
    }

    const dateString = formatDate(startDate);

    const render = () => {
        let newAppointmentModal;

        let content;
        switch (view) {
            case 'calendar':
                content = (
                    <WeekCalendar
                        startDate={startDate}
                        action={action}
                        secondaryAction={secondaryAction}
                        id={id}
                        appointments={openAppointments.enrichedData}
                    />
                );
                break;
            case 'booking-list':
                content = (
                    <AppointmentsList
                        startDate={startDate}
                        id={id}
                        action={action}
                        secondaryAction={secondaryAction}
                        appointments={openAppointments.enrichedData}
                    />
                );
                break;
        }

        if (secondaryAction === 'new' || secondaryAction === 'edit')
            newAppointmentModal = (
                <NewAppointment
                    appointments={openAppointments.data}
                    action={action}
                    id={id}
                />
            );

        return (
            <div className="kip-schedule">
                <CardContent>
                    <div className="kip-non-printable">
                        {newAppointmentModal}
                        <Button href={`/provider/schedule/${dateString}/new`}>
                            <Trans id="schedule.appointment.add">
                                Termin erstellen
                            </Trans>
                        </Button>
                        &nbsp;
                        <DropdownMenu
                            title={
                                <F>
                                    <Icon icon="calendar" />{' '}
                                    <Trans id={scheduleMessages[view]} />
                                </F>
                            }
                        >
                            <DropdownMenuItem
                                icon="calendar"
                                onClick={() => setView('calendar')}
                            >
                                <Trans id="schedule.calendar">
                                    Kalenderansicht
                                </Trans>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                icon="list"
                                onClick={() => setView('booking-list')}
                            >
                                <Trans id="schedule.booking-list">
                                    Buchungliste
                                </Trans>
                            </DropdownMenuItem>
                        </DropdownMenu>
                        <hr />
                    </div>
                    {content}
                </CardContent>
                <Message type="info" waiting>
                    <Trans id="schedule.updating">
                        Ansicht wird automatisch aktualisiert. Letzte
                        Aktualisierung: {lastUpdated}
                    </Trans>
                </Message>
            </div>
        );
    };

    // we wait until all resources have been loaded before we display the form
    return (
        <WithLoader
            resources={[keyPairs, openAppointments]}
            renderLoaded={render}
        />
    );
};

export default withTimer(
    withActions(InvitationsPage, [keys, keyPairs, openAppointments]),
    2000
);
