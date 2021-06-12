// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, Fragment as F } from 'react';
import { buf2hex, b642buf } from 'helpers/conversion';
import classNames from 'helpers/classnames';
import { urlEncode } from 'helpers/data';
import Form from 'helpers/form';
import {
    withRouter,
    withSettings,
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
import t from './translations.yml';
import './schedule.scss';

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
};

function getHexId(id) {
    return buf2hex(b642buf(id));
}

const AppointmentOverview = withActions(
    ({
        openAppointmentsAction,
        cancelAppointmentAction,
        appointment,
        action,
        onClose,
        ...props
    }) => {
        const [showDelete, setShowDelete] = useState(false);
        let acceptedItems = appointment.slotData
            .map(sl => {
                if (sl.open) return;
                return (
                    <li className="kip-is-code" key={sl.id}>
                        {sl.token.data.code}
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
                                <T
                                    t={t}
                                    k="appointment-overview.details.date"
                                />
                                :{' '}
                                {new Date(
                                    appointment.timestamp
                                ).toLocaleDateString()}{' '}
                                {new Date(
                                    appointment.timestamp
                                ).toLocaleTimeString()}
                            </li>
                            <li>
                                <T
                                    t={t}
                                    k="appointment-overview.details.slots"
                                />
                                : {appointment.slotData.length}{' '}
                            </li>
                            <li>
                                <T
                                    t={t}
                                    k="appointment-overview.details.booked"
                                />
                                :{' '}
                                {
                                    appointment.slotData.filter(sl => !sl.open)
                                        .length
                                }{' '}
                            </li>
                        </ul>
                        <hr />
                        <PropertyTags verbose appointment={appointment} />
                        {(acceptedItems.length > 0 && (
                            <F>
                                <h3>
                                    <T
                                        t={t}
                                        k="appointment-overview.details.booking-codes"
                                    />
                                </h3>
                                <ul className="kip-booking-codes">
                                    {acceptedItems}
                                </ul>
                            </F>
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
                            href={`/provider/schedule/${action}/edit/${hexId}`}
                        >
                            <T t={t} k="appointment-overview.edit.button" />
                        </Button>
                        &nbsp;
                        <Button
                            type="danger"
                            onClick={() => setShowDelete(true)}
                        >
                            <T t={t} k="appointment-overview.delete.button" />
                        </Button>
                    </CardFooter>
                </Card>
            </Modal>
        );
    },
    [cancelAppointment, openAppointments]
);

const PropertyTags = ({ appointment, verbose }) => {
    const props = Object.entries(appointment)
        .filter(([k, v]) => v === true)
        .map(([k, v]) => <PropertyTag verbose={verbose} key={k} property={k} />)
        .filter(p => p !== undefined);
    return <F>{props}</F>;
};

const PropertyTag = withSettings(({ settings, property, verbose }) => {
    const lang = settings.get('lang');
    const properties = settings.get('appointmentProperties');
    for (const [category, values] of Object.entries(properties)) {
        const prop = values.values[property];
        if (prop !== undefined) {
            return (
                <span key={property} className={`kip-tag kip-is-${property}`}>
                    {verbose ? prop[lang] : prop.tag[lang]}
                </span>
            );
        }
    }
});

const AppointmentCard = withRouter(
    ({ router, action, secondaryAction, id, appointment, n }) => {
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

        const close = () =>
            router.navigateToUrl(`/provider/schedule/${action}`);
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
                        router.navigateToUrl(
                            `/provider/schedule/${action}/show/${hexId}`
                        );
                }}
                className={classNames('kip-appointment-card', {
                    'kip-is-active': active,
                })}
            >
                {modal}
                {!tiny && (
                    <F>
                        <span className="kip-tag kip-is-open">
                            {appointment.slots}
                        </span>
                        <span className="kip-tag kip-is-booked">
                            ·{' '}
                            {appointment.slotData.filter(sl => !sl.open).length}{' '}
                            ·
                        </span>
                        <PropertyTags appointment={appointment} />
                    </F>
                )}
            </div>
        );
    }
);

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

const HourRow = withRouter(
    ({
        appointments,
        action,
        router,
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
            router.navigateToUrl(`/provider/schedule/${action}/new#${query}`);
        };

        let hasAppointments = relevantAppointments.length > 0;
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
    }
);

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
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    appointments.forEach(app => {
        const date = new Date(app.timestamp);
        if (date < startDate || date > endDate || app.slots === 0) return;
        const hours = date.getHours();
        if (fromHour === undefined || hours < fromHour) fromHour = hours;
        if (toHour === undefined || hours > toHour) toHour = hours;
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
    return <div className="kip-week-calendar">{dayColumns}</div>;
};

class AppointmentForm extends Form {
    validate() {
        const errors = {};
        if (this.data.date === undefined)
            errors.date = this.settings.t(
                t,
                'new-appointment.please-enter-date'
            );
        else if (this.data.time === undefined)
            errors.time = this.settings.t(
                t,
                'new-appointment.please-enter-time'
            );
        else {
            this.data.timestamp = new Date(
                `${this.data.date} ${this.data.time}`
            );
            if (this.data.timestamp < new Date())
                errors.date = this.settings.t(t, 'new-appointment.in-the-past');
            // we allow appointments max. 30 days in the future
            if (
                this.data.timestamp >
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30)
            )
                errors.date = this.settings.t(
                    t,
                    'new-appointment.too-far-in-the-future'
                );
        }
        if (this.data.slots > 50) {
            errors.slots = this.settings.t(t, 'new-appointment.too-many-slots');
        }
        if (this.data.slots < 1) {
            errors.slots = this.settings.t(t, 'new-appointment.too-few-slots');
        }
        return errors;
    }
}

const NewAppointment = withSettings(
    withActions(
        withRouter(
            withForm(
                ({
                    updateAppointment,
                    createAppointment,
                    appointments,
                    existingAppointment,
                    settings,
                    route,
                    action,
                    id,
                    createAppointmentAction,
                    updateAppointmentAction,
                    openAppointmentsAction,
                    router,
                    form: { valid, error, data, set, reset },
                }) => {
                    let actionUrl = '';
                    if (action !== undefined) actionUrl = `/${action}`;
                    if (id !== undefined) actionUrl += `/view/${id}`;
                    const [initialized, setInitialized] = useState(false);
                    const [saving, setSaving] = useState(false);
                    const cancel = () =>
                        router.navigateToUrl(`/provider/schedule${actionUrl}`);

                    let appointment;

                    if (id !== undefined)
                        appointment = appointments.find(
                            app => getHexId(app.id) === id
                        );

                    const save = () => {
                        let action;
                        setSaving(true);
                        if (appointment !== undefined)
                            action = updateAppointmentAction;
                        else action = createAppointmentAction;
                        const promise = action(data, appointment);
                        promise.finally(() => setSaving(false));
                        promise.then(() => {
                            // we reload the appointments
                            openAppointmentsAction();
                            // and we go back to the schedule view
                            router.navigateToUrl(
                                `/provider/schedule${actionUrl}`
                            );
                        });
                    };

                    useEffect(() => {
                        if (initialized) return;
                        setInitialized(true);
                        if (appointment !== undefined) {
                            const appointmentData = {
                                time: appointment.time,
                                date: appointment.date,
                                slots: appointment.slots,
                                duration: appointment.duration,
                            };
                            for (const [_, v] of Object.entries(properties)) {
                                for (const [kk, _] of Object.entries(
                                    v.values
                                )) {
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
                            addProps: for (const [_, v] of Object.entries(
                                properties
                            )) {
                                for (const [kk, _] of Object.entries(
                                    v.values
                                )) {
                                    if (firstProperty === undefined)
                                        firstProperty = kk;
                                    if (data[kk] !== undefined) {
                                        found = true;
                                        newData[kk] = true;
                                        break addProps;
                                    }
                                }
                            }
                            if (!found) newData[firstProperty] = true;

                            if (route.hashParams !== undefined) {
                                if (route.hashParams.timestamp !== undefined) {
                                    const date = new Date(
                                        route.hashParams.timestamp
                                    );
                                    newData.time = formatTime(date);
                                    newData.date = formatDate(date);
                                }
                            }
                            reset(newData);
                        }
                    });

                    const properties = settings.get('appointmentProperties');

                    const apptProperties = Object.entries(properties).map(
                        ([k, v]) => {
                            const options = Object.entries(v.values).map(
                                ([kv, vv]) => ({
                                    value: kv,
                                    key: vv,
                                    title: (
                                        <T
                                            t={properties}
                                            k={`${k}.values.${kv}`}
                                        />
                                    ),
                                })
                            );

                            let currentOption;

                            for (const [k, v] of Object.entries(data)) {
                                for (const option of options) {
                                    if (k === option.value && v === true)
                                        currentOption = k;
                                }
                            }

                            const changeTo = option => {
                                const newData = { ...data };
                                for (const option of options)
                                    newData[option.value] = undefined;
                                newData[option.value] = true;
                                reset(newData);
                            };

                            return (
                                <F key={k}>
                                    <h2>
                                        <T t={properties} k={`${k}.title`} />
                                    </h2>
                                    <RichSelect
                                        options={options}
                                        value={currentOption}
                                        onChange={option => changeTo(option)}
                                    />
                                </F>
                            );
                        }
                    );

                    const durations = [
                        10,
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
                    ].map(v => ({
                        value: v,
                        title: (
                            <T
                                t={t}
                                k={`schedule.appointment.duration.title`}
                                duration={v}
                            />
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
                            title={<T t={t} k="new-appointment.title" />}
                        >
                            <FormComponent>
                                <FieldSet>
                                    <div className="kip-field">
                                        <Label htmlFor="date">
                                            <T t={t} k="new-appointment.date" />
                                        </Label>
                                        <ErrorFor error={error} field="date" />
                                        <input
                                            value={data.date || ''}
                                            type="date"
                                            className="bulma-input"
                                            onChange={e =>
                                                set('date', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="kip-field">
                                        <Label htmlFor="time">
                                            <T t={t} k="new-appointment.time" />
                                        </Label>
                                        <ErrorFor error={error} field="time" />
                                        <input
                                            type="time"
                                            className="bulma-input"
                                            value={data.time || ''}
                                            onChange={e =>
                                                set('time', e.target.value)
                                            }
                                            step={60}
                                        />
                                    </div>
                                    <div className="kip-field kip-is-fullwidth kip-slider">
                                        <Label htmlFor="slots">
                                            <T
                                                t={t}
                                                k="new-appointment.slots"
                                            />
                                        </Label>
                                        <ErrorFor error={error} field="slots" />
                                        <input
                                            type="number"
                                            className="bulma-input"
                                            value={data.slots || 1}
                                            onChange={e =>
                                                set(
                                                    'slots',
                                                    parseInt(e.target.value)
                                                )
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
                                            onChange={value =>
                                                set('duration', value.value)
                                            }
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
                },
                AppointmentForm,
                'form'
            )
        ),
        [createAppointment, updateAppointment, openAppointments]
    )
);

// https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

// https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
function formatTime(date) {
    var d = new Date(date),
        hours = '' + d.getHours(),
        minutes = '' + d.getMinutes();

    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;

    return [hours, minutes].join(':');
}

const Invitations = withTimer(
    withSettings(
        withRouter(
            withActions(
                ({
                    action,
                    secondaryAction,
                    id,
                    keys,
                    keysAction,
                    lastUpdated,
                    keyPairs,
                    timer,
                    route,
                    settings,
                    keyPairsAction,
                    invitationQueues,
                    invitationQueuesAction,
                    openAppointments,
                    openAppointmentsAction,
                    router,
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
                                new Date(
                                    Number(year),
                                    Number(month) - 1,
                                    Number(day)
                                )
                            );
                        }
                    }

                    if (startDate === undefined)
                        startDate = getMonday(new Date());

                    let dateString = formatDate(startDate);

                    const goBackward = () => {
                        const newDate = formatDate(
                            getMonday(
                                new Date(
                                    startDate.getTime() -
                                        1000 * 60 * 60 * 24 * 7
                                )
                            )
                        );
                        router.navigateToUrl(`/provider/schedule/${newDate}`);
                    };

                    const goForward = () => {
                        const newDate = formatDate(
                            getMonday(
                                new Date(
                                    startDate.getTime() +
                                        1000 * 60 * 60 * 24 * 7
                                )
                            )
                        );
                        router.navigateToUrl(`/provider/schedule/${newDate}`);
                    };

                    const render = () => {
                        let newAppointmentModal;

                        if (
                            secondaryAction === 'new' ||
                            secondaryAction === 'edit'
                        )
                            newAppointmentModal = (
                                <NewAppointment
                                    route={route}
                                    appointments={openAppointments.data}
                                    action={action}
                                    id={id}
                                />
                            );

                        return (
                            <div className="kip-schedule">
                                <CardContent>
                                    {newAppointmentModal}
                                    <Button
                                        href={`/provider/schedule/${dateString}/new`}
                                    >
                                        <T t={t} k="schedule.appointment.add" />
                                    </Button>
                                    <hr />
                                    <div className="kip-schedule-navigation">
                                        <Button
                                            className="kip-backward"
                                            type=""
                                            onClick={goBackward}
                                        >
                                            <T t={t} k="schedule.backward" />
                                        </Button>
                                        <Button
                                            className="kip-forward"
                                            type=""
                                            onClick={goForward}
                                        >
                                            <T t={t} k="schedule.forward" />
                                        </Button>
                                    </div>
                                    <WeekCalendar
                                        startDate={startDate}
                                        action={action}
                                        secondaryAction={secondaryAction}
                                        id={id}
                                        appointments={
                                            openAppointments.enrichedData
                                        }
                                    />
                                </CardContent>
                                <Message type="info" waiting>
                                    <T
                                        t={t}
                                        k="schedule.updating"
                                        lastUpdated={lastUpdated}
                                    />
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
                },
                [keys, keyPairs, openAppointments]
            )
        )
    ),
    2000
);

export default Invitations;
