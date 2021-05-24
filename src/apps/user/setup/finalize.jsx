// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

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
