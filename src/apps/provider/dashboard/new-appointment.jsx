import React, { useState } from 'react';
import {
    withForm,
    T,
    RichSelect,
    Modal,
    Form as FormComponent,
    FieldSet,
    Label,
    ErrorFor,
} from 'components';
import { useSettings, useRouter, useEffectOnce } from 'hooks';
import { formatTime, formatDate } from 'helpers/time';
import { hexId } from 'helpers/conversion';
import Form from 'helpers/form';
import t from './translations.yml';

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

const NewAppointment = withForm(
    ({ route, action, id, form: { valid, error, data, set, reset } }) => {
        let actionUrl = '';
        const settings = useSettings();
        const router = useRouter();
        if (action !== undefined) actionUrl = `/${action}`;
        if (id !== undefined) actionUrl += `/view/${id}`;
        const [saving, setSaving] = useState(false);
        const cancel = () =>
            router.navigateToUrl(`/provider/schedule${actionUrl}`);

        let appointment;

        if (id !== undefined)
            appointment = appointments.find((app) => hexId(app.id) === id);

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
                router.navigateToUrl(`/provider/schedule${actionUrl}`);
            });
        };

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

                if (route.hashParams !== undefined) {
                    if (route.hashParams.timestamp !== undefined) {
                        const date = new Date(route.hashParams.timestamp);
                        newData.time = formatTime(date);
                        newData.date = formatDate(date);
                    }
                }
                reset(newData);
            }
        });

        const properties = settings.get('appointmentProperties');

        const apptProperties = Object.entries(properties).map(([k, v]) => {
            const options = Object.entries(v.values).map(([kv, vv]) => ({
                value: kv,
                key: vv,
                title: <T t={properties} k={`${k}.values.${kv}`} />,
            }));

            let currentOption;

            for (const [k, v] of Object.entries(data)) {
                for (const option of options) {
                    if (k === option.value && v === true) currentOption = k;
                }
            }

            const changeTo = (option) => {
                const newData = { ...data };
                for (const option of options) newData[option.value] = undefined;
                newData[option.value] = true;
                reset(newData);
            };

            return (
                <React.Fragment key={k}>
                    <h2>
                        <T t={properties} k={`${k}.title`} />
                    </h2>
                    <RichSelect
                        options={options}
                        value={currentOption}
                        onChange={(option) => changeTo(option)}
                    />
                </React.Fragment>
            );
        });

        const durations = [
            5, 10, 15, 20, 30, 45, 60, 90, 120, 150, 180, 210, 240,
        ].map((v) => ({
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
                title={
                    <T
                        t={t}
                        k={
                            appointment !== undefined
                                ? 'edit-appointment.title'
                                : 'new-appointment.title'
                        }
                    />
                }
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
                                onChange={(e) => set('date', e.target.value)}
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
                                onChange={(e) => set('time', e.target.value)}
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
                                onChange={(e) =>
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
                                onChange={(value) =>
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
);

export default NewAppointment;
