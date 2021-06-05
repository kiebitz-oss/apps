// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, Fragment as F } from 'react';
import Form from 'helpers/form';
import {
    withRouter,
    withSettings,
    withForm,
    withActions,
    WithLoader,
    withTimer,
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
    CardFooter,
    CardContent,
    Button,
} from 'components';
import {
    keys,
    keyPairs,
    createAppointment,
    openAppointments,
} from '../actions';
import t from './translations.yml';
import './schedule.scss';

const appointmentProperties = t.schedule.appointment.properties;

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
};

const AppointmentsOverview = ({ appointments, ...props }) => {
    let acceptedItems;
    return (
        <Modal {...props} title={<T t={t} k="appointments-overview.title" />}>
            <ul>{acceptedItems}</ul>
        </Modal>
    );
};

const PropertyTags = ({ appointment }) => {
    const props = Object.entries(appointment)
        .filter(([k, v]) => v === true)
        .map(([k, v]) => <PropertyTag key={k} property={k} />)
        .filter(p => p !== undefined);
    return <F>{props}</F>;
};

const PropertyTag = withSettings(({ settings, property }) => {
    const lang = settings.get('lang');
    for (const [category, values] of Object.entries(appointmentProperties)) {
        const prop = values.values[property];
        if (prop !== undefined) {
            return (
                <span key={property} className={`kip-tag kip-is-${property}`}>
                    {prop.tag[lang]}
                </span>
            );
        }
    }
});

const AppointmentCard = ({ appointment, n }) => {
    const p = Math.floor((appointment.duration / 60) * 100);
    const w = Math.floor(97.5 / (1 + appointment.maxOverlap) - 2.5);
    const i = appointment.overlapsWith.filter(
        oa => oa.index < appointment.index
    ).length;
    const l = Math.floor(2.5 + i * (w + 2.5));
    return (
        <div
            style={{
                height: `calc(${p}% - 8px)`,
                width: `${w}%`,
                left: `${l}%`,
            }}
            className="kip-appointment-card"
        >
            <span className="kip-tag kip-is-booked">
                {appointment.slotData.filter(sl => !sl.open).length}
            </span>
            <span className="kip-tag kip-is-open">
                {appointment.slotData.filter(sl => sl.open).length}
            </span>
            <PropertyTags appointment={appointment} />
        </div>
    );
};

const CalendarAppointments = ({ appointments }) => {
    const [showModal, setShowModal] = useState(false);
    let modal;
    const close = () => setShowModal(false);
    const appointmentsItems = appointments
        .filter(ap => ap.startsHere)
        .map(({ appointment }) => (
            <AppointmentCard
                key={appointment.slotData[0].id}
                appointment={appointment}
                n={appointments.length}
            />
        ));
    if (showModal)
        modal = (
            <AppointmentsOverview
                onCancel={close}
                onClose={close}
                appointments={appointments}
            />
        );
    return (
        <F>
            {modal}
            <div
                className="kip-appointments"
                onClick={() => setShowModal(true)}
            >
                {appointmentsItems}
            </div>
        </F>
    );
};

const HourRow = ({ appointments, date, day, hour }) => {
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
    let hasAppointments = relevantAppointments.length > 0;
    return (
        <div
            className={
                'kip-hour-row' +
                (hasAppointments ? ' kip-has-appointments' : '')
            }
        >
            {hasAppointments && (
                <CalendarAppointments
                    ots={ots}
                    ote={ote}
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
                <T t={t} k={`day-${day + 1}`} />
            </span>
            <span className="kip-date">{date.toLocaleDateString()}</span>
        </div>
    );
};

const DayColumn = ({ day, date, appointments }) => {
    const hourRows = [
        <DayLabelRow
            appointments={appointments}
            date={date}
            day={day}
            key="-"
        />,
    ];
    for (let i = 0; i < 24; i++) {
        hourRows.push(
            <HourRow
                appointments={appointments}
                key={i}
                hour={i}
                day={day}
                date={date}
            />
        );
    }
    return <div className="kip-day-column">{hourRows}</div>;
};

const DayLabelColumn = () => {
    const hourRows = [<HourLabelRow hour="-" key="-" />];
    for (let i = 0; i < 24; i++) {
        hourRows.push(<HourLabelRow hour={i} key={i} />);
    }
    return <div className="kip-day-column kip-is-day-label">{hourRows}</div>;
};

const WeekCalendar = ({ startDate, appointments }) => {
    const dayColumns = [<DayLabelColumn key="-" appointments={appointments} />];
    const date = new Date(startDate);
    for (let i = 0; i < 7; i++) {
        dayColumns.push(
            <DayColumn
                appointments={appointments}
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

const NewAppointment = withActions(
    withRouter(
        withForm(
            ({
                createAppointment,
                createAppointmentAction,
                openAppointmentsAction,
                router,
                form: { valid, error, data, set, reset },
            }) => {
                const [initialized, setInitialized] = useState(false);
                const cancel = () => router.navigateToUrl('/provider/schedule');
                const save = () => {
                    createAppointmentAction(data).then(() => {
                        // we reload the appointments
                        openAppointmentsAction();
                        // and we go back to the schedule view
                        router.navigateToUrl('/provider/schedule');
                    });
                };

                useEffect(() => {
                    if (initialized) return;
                    setInitialized(true);
                    reset({
                        duration: 30,
                        slots: 1,
                        biontech: true,
                    });
                });

                const properties = Object.entries(appointmentProperties).map(
                    ([k, v]) => {
                        const options = Object.entries(v.values).map(
                            ([kv, vv]) => ({
                                value: kv,
                                key: vv,
                                title: (
                                    <T
                                        t={t}
                                        k={`schedule.appointment.properties.${k}.values.${kv}`}
                                    />
                                ),
                            })
                        );

                        let currentOption;

                        for (const [k, v] of Object.entries(data)) {
                            for (const option of options) {
                                if (k === option.value) currentOption = k;
                            }
                        }

                        const changeTo = option => {
                            const newData = { ...data };
                            for (const option of options)
                                delete newData[option.value];
                            newData[option.value] = true;
                            reset(newData);
                        };

                        return (
                            <F key={k}>
                                <h2>
                                    <T
                                        t={t}
                                        k={`schedule.appointment.properties.${k}.title`}
                                    />
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
                        saveDisabled={!valid}
                        className="kip-new-appointment"
                        onSave={save}
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
                                        <T t={t} k="new-appointment.slots" />
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
                                    {properties}
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
    [createAppointment, openAppointments]
);

// https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

const Invitations = withTimer(
    withSettings(
        withRouter(
            withActions(
                ({
                    action,
                    id,
                    keys,
                    keysAction,
                    lastUpdated,
                    keyPairs,
                    timer,
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

                    let newAppointmentModal;

                    if (action === 'new-appointment')
                        newAppointmentModal = <NewAppointment />;

                    const startDate = getMonday(new Date());

                    const render = () => {
                        return (
                            <div className="kip-schedule">
                                <CardContent>
                                    {newAppointmentModal}
                                    <Button
                                        href="/provider/schedule/new-appointment"
                                    >
                                        <T
                                            t={t}
                                            k="schedule.appointment.add"
                                        />
                                    </Button>
                                    <WeekCalendar
                                        startDate={startDate}
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

/*
                                        <DropdownMenuItem
                                            icon="list"
                                            onClick={() => console.log('foo')}
                                        >
                                            <T
                                                t={t}
                                                k="schedule.appointment.series"
                                            />
                                        </DropdownMenuItem>


                                        <DropdownMenuItem
                                            icon="list"
                                            onClick={() => setView('list')}
                                        >
                                            <T t={t} k="schedule.view.list" />
                                        </DropdownMenuItem>

*/
