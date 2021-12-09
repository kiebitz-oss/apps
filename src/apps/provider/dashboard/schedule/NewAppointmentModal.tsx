import React from 'react';
import { t, Trans } from '@lingui/macro';
import {
    useForm,
    SubmitHandler,
    Resolver,
    FormProvider,
} from 'react-hook-form';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useEffectOnce } from 'react-use';
import { withActions } from 'components';
import { useSettings } from 'hooks';
import { formatTime, formatDate } from 'helpers/time';
import {
    Button,
    Form,
    InputField,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    SelectField,
    Title,
} from 'ui';
import {
    createAppointment,
    updateAppointment,
    openAppointments,
} from 'apps/provider/actions';
import { getHexId } from 'helpers/conversion';
import { Appointment } from 'types';

interface FormData {
    date?: string;
    time?: string;
    timestamp: Date;
    slots: number;
    duration: number;
}

const resolver: Resolver<FormData> = async (values) => {
    const errors: any = {};

    if (values.date === undefined) {
        errors.date = t({ id: 'new-appointment.please-enter-date' });
    } else if (values.time === undefined) {
        errors.time = t({ id: 'new-appointment.please-enter-time' });
    } else {
        values.timestamp = new Date(`${values.date} ${values.time}`);

        if (values.timestamp < new Date()) {
            errors.date = t({ id: 'new-appointment.in-the-past' });
        }

        // we allow appointments max. 30 days in the future
        if (
            values.timestamp >
            new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30)
        ) {
            errors.date = t({
                id: 'new-appointment.too-far-in-the-future',
                message:
                    'Bitte wählen Sie Termine die maximal 30 Tage in der Zukunft liegen',
            });
        }
    }

    if (values.slots > 50) {
        errors.slots = t({ id: 'new-appointment.too-many-slots' });
    }

    if (values.slots < 1) {
        errors.slots = t({ id: 'new-appointment.too-few-slots' });
    }

    return {
        values,
        errors,
    };
};

const NewAppointmentModalBase: React.FC<any> = ({
    appointments,
    createAppointmentAction,
    updateAppointmentAction,
    openAppointmentsAction,
}) => {
    const navigate = useNavigate();
    const { hash } = useLocation();
    const settings = useSettings();
    const { action, id } = useParams();

    const methods = useForm<FormData>({
        mode: 'onChange',
        resolver,
    });

    const { register, handleSubmit, formState, reset, getValues } = methods;

    const data = getValues();

    let actionUrl = '';

    if (action !== undefined) {
        actionUrl = `/${action}`;
    }

    if (id !== undefined) {
        actionUrl += `/view/${id}`;
    }

    const cancel = () => navigate(`/provider/schedule${actionUrl}`);

    let appointment: Appointment | undefined;

    if (id !== undefined) {
        appointment = appointments.find((app) => getHexId(app.id) === id);
    }

    useEffectOnce(() => {
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

    const onSubmit: SubmitHandler<FormData> = (data) => {
        let action;

        // we remove unnecessary fields like 'time' and 'date'
        delete data.time;
        delete data.date;

        if (appointment !== undefined) {
            action = updateAppointmentAction;
        } else {
            action = createAppointmentAction;
        }

        const promise = action(data, appointment);

        promise.finally(() => setSaving(false));

        promise.then(() => {
            // we reload the appointments
            openAppointmentsAction();
            // and we go back to the schedule view
            navigate(`/provider/schedule${actionUrl}`);
        });
    };

    const properties = settings.get('appointmentProperties');

    const apptProperties = Object.entries(properties).map(([k, v]) => {
        const options = Object.entries(v.values).map(([kv, vv]) => {
            return {
                value: kv,
                label: vv['de'],
                // label: `${k}.values.${kv}`,
            };
        });

        return (
            <React.Fragment key={k}>
                <SelectField
                    options={options}
                    label={t({ message: v.title['de'], id: `${k}.title` })}
                    // onChange={(option) => changeTo(option)}
                    {...register(k)}
                />
            </React.Fragment>
        );
    });

    return (
        <Modal onClose={cancel}>
            <FormProvider {...methods}>
                <Form name="new-appointment" onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader>
                        <Title>
                            {appointment !== undefined ? (
                                <Trans id="edit-appointment.title">
                                    Termin bearbeiten
                                </Trans>
                            ) : (
                                <Trans id="new-appointment.title">
                                    Neuen Termin erstellen
                                </Trans>
                            )}
                        </Title>
                    </ModalHeader>

                    <ModalContent className="flex flex-col gap-6">
                        <InputField
                            label={t({
                                id: 'new-appointment.date',
                                message: 'Datum',
                            })}
                            type="date"
                            {...register('date')}
                        />

                        <InputField
                            label={t({
                                id: 'new-appointment.time',
                                message: 'Uhrzeit',
                            })}
                            type="time"
                            {...register('time')}
                        />

                        <InputField
                            label={t({
                                id: 'new-appointment.slots',
                                message: 'Anzahl Impfdosen',
                            })}
                            type="number"
                            step={1}
                            min={1}
                            max={50}
                            {...register('slots')}
                        />

                        <SelectField
                            label={t({
                                id: 'new-appointment.duration',
                                message: 'Vstl. Dauer',
                            })}
                            options={[
                                5, 10, 15, 20, 30, 45, 60, 90, 120, 150, 180,
                                210, 240,
                            ].map((duration) => ({
                                label: t({
                                    id: 'schedule.appointment.duration.title',
                                    message: `Dauer: ${duration} Minuten`,
                                }),
                                value: duration,
                            }))}
                            {...register('duration')}
                        />

                        {apptProperties}
                    </ModalContent>

                    <ModalFooter>
                        <Button
                            disabled={
                                !formState.isValid || formState.isSubmitting
                            }
                        >
                            Speichern
                        </Button>
                    </ModalFooter>
                </Form>
            </FormProvider>
        </Modal>
    );
};

export const NewAppointmentModal = withActions(NewAppointmentModalBase, [
    createAppointment,
    updateAppointment,
    openAppointments,
]);
