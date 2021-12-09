// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import { formatDate, getMonday } from 'helpers/time';
import { withActions, WithLoader } from 'components';
import {
    BoxContent,
    DropdownMenu,
    DropdownMenuItem,
    Message,
    Icon,
    Link,
    Title,
} from 'ui';
import { keys, keyPairs, openAppointments } from 'apps/provider/actions';
import { defineMessage, t, Trans } from '@lingui/macro';
import { useParams } from 'react-router';
import { useEffectOnce } from 'react-use';
import { AppointmentsList } from './AppointmentsList';
import { NewAppointmentModal } from './NewAppointmentModal';
import { WeekCalendar } from './WeekCalendar';

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

const ScheduleTabBase: React.FC<any> = ({
    keysAction,
    lastUpdated,
    keyPairs,
    keyPairsAction,
    openAppointments,
    openAppointmentsAction,
}) => {
    const [view, setView] = useState('calendar');
    const { action: actionParam, secondaryAction } = useParams();

    useEffectOnce(() => {
        // we load all the necessary data
        keyPairsAction();
        openAppointmentsAction();
        keysAction();
    });

    let startDate;

    if (actionParam !== undefined) {
        const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(actionParam);

        if (result) {
            const [, year, month, day] = result;

            startDate = getMonday(
                new Date(Number(year), Number(month) - 1, Number(day))
            );
        }
    }

    if (startDate === undefined) {
        startDate = getMonday(new Date());
    }

    const action =
        actionParam === undefined ? formatDate(startDate) : actionParam;

    const dateString = formatDate(startDate);

    const render = () => {
        let newAppointmentModal;
        let content;

        switch (view) {
            default:
            case 'calendar':
                content = (
                    <WeekCalendar
                        startDate={startDate}
                        appointments={openAppointments.enrichedData}
                    />
                );
                break;
            case 'booking-list':
                content = (
                    <AppointmentsList
                        startDate={startDate}
                        appointments={openAppointments.enrichedData}
                    />
                );
                break;
        }

        if (secondaryAction === 'new' || secondaryAction === 'edit') {
            newAppointmentModal = (
                <NewAppointmentModal appointments={openAppointments.data} />
            );
        }

        return (
            <div className="kip-schedule">
                <BoxContent>
                    {newAppointmentModal}

                    <div className="flex justify-between mb-8">
                        <DropdownMenu
                            label={t({
                                id: scheduleMessages[view].id,
                                message: scheduleMessages[view].message,
                            })}
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

                        <Link
                            type="button"
                            variant="primary"
                            href={`/provider/schedule/${dateString}/new`}
                        >
                            <Trans id="schedule.appointment.add">
                                Termin erstellen
                            </Trans>
                        </Link>
                    </div>

                    <hr className="mb-8 text-gray-200" />

                    {content}
                </BoxContent>

                <Message variant="info" waiting>
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

export const ScheduleTab = withActions(ScheduleTabBase, [
    keys,
    keyPairs,
    openAppointments,
]);
