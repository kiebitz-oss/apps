// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { useState, useEffect } from 'react';
import { QueueSelect } from 'apps/provider/dashboard/queue-select';
import { queues } from 'apps/provider/dashboard/actions';
import Form from 'helpers/form';
import { contactData } from './actions';
import {
    withRouter,
    withForm,
    withActions,
    WithLoader,
    Form as FormComponent,
    FieldSet,
    RetractingLabelInput,
    ErrorFor,
    T,
    CardFooter,
    CardContent,
    SubmitField,
    Button,
} from 'components';
import t from './translations.yml';
import './contact-data.scss';

class ContactDataForm extends Form {
    validate() {
        const errors = {};
        if (!this.data.name || this.data.name.length < 2)
            errors.name = this.settings.t(t, 'contact-data.invalid-name');
        return errors;
    }
}

const BaseContactData = ({
    queues,
    queuesAction,
    contactData,
    contactDataAction,
    form: { set, data, error, valid },
    router,
}) => {
    const [modified, setModified] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const onSubmit = () => {
        if (!valid) return;
        contactDataAction(data);
        // we redirect to the 'verify' step
        router.navigateToUrl(`/user/setup/verify`);
    };

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        queuesAction();
        setModified(false);
    });

    const submitting = false;

    const setAndMarkModified = (key, value) => {
        setModified(true);
        set(key, value);
    };

    const removeQueue = oldQueue => {
        const queues = data.queues || [];
        const newQueues = [];
        for (const queue of queues) {
            if (queue === oldQueue.id) continue;
            newQueues.push(queue);
        }
        set('queues', newQueues);
        setModified(true);
    };

    const addQueue = newQueue => {
        const queues = data.queues || [];
        for (const queue of queues) {
            if (queue === newQueue.id) return;
        }
        queues.push(newQueue.id);
        set('queues', queues);
        setModified(true);
    };

    const render = () => {
        const controls = (
            <React.Fragment>
                <ErrorFor error={error} field="queues" />
                <QueueSelect
                    queues={queues.data}
                    existingQueues={data.queues || []}
                    addQueue={addQueue}
                    removeQueue={removeQueue}
                />
                <ErrorFor error={error} field="name" />
                <RetractingLabelInput
                    value={data.name || ''}
                    onChange={value => setAndMarkModified('name', value)}
                    label={<T t={t} k="contact-data.name" />}
                />
                <h2>
                    <T t={t} k="contact-data.optional.title" />
                </h2>
                <ErrorFor error={error} field="email" />
                <RetractingLabelInput
                    value={data.email || ''}
                    onChange={value => setAndMarkModified('email', value)}
                    label={<T t={t} k="contact-data.email" />}
                />
            </React.Fragment>
        );

        const redirecting = false;

        return (
            <React.Fragment>
                <div className="kip-cm-contact-data">
                    <FormComponent onSubmit={onSubmit}>
                        <FieldSet disabled={submitting}>
                            {
                                <React.Fragment>
                                    <CardContent>{controls}</CardContent>
                                    <CardFooter>
                                        <SubmitField
                                            disabled={!valid}
                                            type={'success'}
                                            onClick={onSubmit}
                                            waiting={submitting || redirecting}
                                            title={
                                                redirecting ? (
                                                    <T
                                                        t={t}
                                                        k="contact-data.success"
                                                    />
                                                ) : submitting ? (
                                                    <T
                                                        t={t}
                                                        k="contact-data.saving"
                                                    />
                                                ) : (
                                                    <T
                                                        t={t}
                                                        k={
                                                            'contact-data.save-and-continue'
                                                        }
                                                    />
                                                )
                                            }
                                        />
                                    </CardFooter>
                                </React.Fragment>
                            }
                        </FieldSet>
                    </FormComponent>
                </div>
            </React.Fragment>
        );
    };

    return <WithLoader resources={[queues]} renderLoaded={render} />;
};

const ContactData = withActions(
    withForm(withRouter(BaseContactData), ContactDataForm, 'form'),
    [contactData, queues]
);

export default ContactData;
