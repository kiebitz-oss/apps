// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { buf2hex, b642buf } from 'helpers/conversion';
import AppointmentsList from './appointments-list';
import WeekCalendar from './week-calendar';
import NewAppointment from './new-appointment';
import { formatDate, getMonday } from 'helpers/time';
import {
    useProvider,
    useInterval,
    useEffectOnce,
} from 'hooks';
import {
    WithLoader,
    CardContent,
    A,
    DropdownMenu,
    DropdownMenuItem,
    Message,
    Icon,
    ErrorFor,
    T,
    Button,
} from 'components';

import t from './translations.yml';
import './schedule.scss';

const Schedule = ({ action, secondaryAction, id, route }) => {
    const [view, setView] = useState('calendar');
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
    const provider = useProvider();

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

    if (startDate === undefined)
        startDate = getMonday(new Date().setHours(0, 0, 0, 0));

    useEffectOnce(async () => {
        const endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + 7);
        // we load all the necessary data
        const response = await provider
            .appointments()
            .get({ from: startDate.toISOString(), to: endDate.toISOString() });
        console.log(response);
    });

    if (action === undefined) {
        action = formatDate(startDate);
    }

    const dateString = formatDate(startDate);

    const render = () => {
        let newAppointmentModal;
        let content;
        const appointments = provider.appointments().result().data;
        switch (view) {
            case 'calendar':
                content = (
                    <WeekCalendar
                        startDate={startDate}
                        action={action}
                        secondaryAction={secondaryAction}
                        id={id}
                        appointments={appointments}
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
                        appointments={appointments}
                    />
                );
                break;
        }

        if (secondaryAction === 'new' || secondaryAction === 'edit')
            newAppointmentModal = (
                <NewAppointment
                    route={route}
                    appointments={appointments}
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
                            <T t={t} k="schedule.appointment.add" />
                        </Button>
                        &nbsp;
                        <DropdownMenu
                            title={
                                <>
                                    <Icon icon="calendar" />{' '}
                                    <T t={t} k={`schedule.${view}`} />
                                </>
                            }
                        >
                            <DropdownMenuItem
                                icon="calendar"
                                onClick={() => setView('calendar')}
                            >
                                <T t={t} k={`schedule.calendar`} />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                icon="list"
                                onClick={() => setView('booking-list')}
                            >
                                <T t={t} k={`schedule.booking-list`} />
                            </DropdownMenuItem>
                        </DropdownMenu>
                        <hr />
                    </div>
                    {content}
                </CardContent>
                <Message type="info" waiting>
                    <T t={t} k="schedule.updating" lastUpdated={lastUpdated} />
                </Message>
            </div>
        );
    };

    // we wait until all resources have been loaded before we display the form
    return (
        <WithLoader
            resources={[provider.appointments().result()]}
            renderLoaded={render}
        />
    );
};

export default Schedule;
