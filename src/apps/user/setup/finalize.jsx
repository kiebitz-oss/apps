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

import React, { useEffect, useRef, useState } from 'react';
import { QueueSelect } from 'apps/provider/dashboard/queue-select';
import { queues } from 'apps/provider/dashboard/actions';
import {
    withSettings,
    withActions,
    withRouter,
    CardContent,
    CardFooter,
    WithLoader,
    Button,
    T,
    A,
} from 'components';
import Wizard from './wizard';
import { submitToQueue, contactData, getToken } from './actions';
import t from './translations.yml';
import './finalize.scss';

/*
Here the user has a chance to review all data that was entered before confirming
the finalization. Once the button gets clicked, the system generates the QR
codes, encrypts the contact data and stores the settings in the storage backend.
*/
const Finalize = withSettings(
    withRouter(
        withActions(
            ({
                settings,
                router,
                queues,
                queuesAction,
                contactData,
                contactDataAction,
                submitToQueue,
                submitToQueueAction,
            }) => {
                const [initialized, setInitialized] = useState(false);
                const [submitting, setSubmitting] = useState(false);
                const [queue, setQueue] = useState(null);
                useEffect(() => {
                    if (initialized) return;
                    setInitialized(true);
                    queuesAction();
                    contactDataAction().then(ct => setQueue(ct.queue || null));
                });

                const selectQueue = newQueue => {
                    contactData.queue = newQueue;
                    contactDataAction(contactData);
                    setQueue(newQueue);
                };

                const removeQueue = queue => {
                    setQueue(null);
                };

                const submit = () => {
                    setSubmitting(true);
                    submitToQueueAction(contactData, queue.data).then(hd => {
                        setSubmitting(false);
                        router.navigateToUrl('/user/setup/store-secrets');
                    });
                };

                const render = () => {
                    return (
                        <React.Fragment>
                            <CardContent>
                                <QueueSelect
                                    queues={queues.data}
                                    single={true}
                                    removeQueue={removeQueue}
                                    existingQueues={
                                        queue !== null ? [queue.id] : []
                                    }
                                    addQueue={selectQueue}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button
                                    waiting={submitting}
                                    type="success"
                                    onClick={submit}
                                    disabled={submitting || queue === null}
                                >
                                    <T
                                        t={t}
                                        k={
                                            submitting
                                                ? 'wizard.please-wait'
                                                : 'wizard.continue'
                                        }
                                    />
                                </Button>
                            </CardFooter>
                        </React.Fragment>
                    );
                };
                return (
                    <WithLoader resources={[queues]} renderLoaded={render} />
                );
            },
            [queues, submitToQueue, contactData]
        )
    )
);

export default Finalize;
