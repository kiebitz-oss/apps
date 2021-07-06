// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, Fragment as F } from 'react';
import { keyPairs, testQueues } from '../actions';
import {
    withRouter,
    withSettings,
    withForm,
    withActions,
    Form as FormComponent,
    Message,
    Modal,
    Form,
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
import './settings.scss';

const TestQueuesModal = withRouter(
    withActions(
        ({ keyPairs, router, testQueues, testQueuesAction }) => {
            const [initialized, setInitialized] = useState(false);

            useEffect(() => {
                if (initialized) return;
                setInitialized(true);
                testQueuesAction(keyPairs);
            });

            const readFile = e => {
                const file = e.target.files[0];
                var reader = new FileReader();

                reader.onload = function(e) {
                    const json = JSON.parse(e.target.result);
                    testQueuesAction(keyPairs, json);
                };

                reader.readAsBinaryString(file);
            };

            let notice;

            const { status } = testQueues;

            if (status === 'invalid')
                notice = (
                    <Message type="danger">
                        <T t={t} k="upload-queues.invalid-file" />
                    </Message>
                );
            else if (status === 'valid')
                notice = (
                    <Message type="success">
                        <T t={t} k="upload-queues.valid-file" />
                    </Message>
                );
            else notice = <T t={t} k="upload-queues.notice" />;

            const footer = (
                <Form>
                    <FieldSet>
                        <label
                            htmlFor="file-upload"
                            className="custom-file-upload"
                        >
                            <T t={t} k="upload-queues.input" />
                            <input
                                id="file-upload"
                                disabled={
                                    keyPairs === undefined ||
                                    keyPairs.data === null
                                }
                                className="bulma-input"
                                type="file"
                                onChange={e => readFile(e)}
                            />
                        </label>
                    </FieldSet>
                </Form>
            );
            return (
                <Modal
                    footer={footer}
                    onClose={() => router.navigateToUrl('/mediator/settings')}
                    className="kip-upload-file"
                    title={<T t={t} k="upload-queues.title" />}
                >
                    {notice}
                </Modal>
            );
        },
        [testQueues]
    )
);

const BaseSettings = ({
    type,
    settings,
    keyPairs,
    keyPairsAction,
    action,
    secondaryAction,
    id,
    router,
}) => {
    let modal;

    const [initialized, setInitialized] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        keyPairsAction();
    });

    const cancel = () => {
        router.navigateToUrl('/mediator/settings');
    };

    const logOut = () => {
        setLoggingOut(true);

        const backend = settings.get('backend');
        backend.local.deleteAll('mediator::');
        router.navigateToUrl('/mediator/logged-out');
    };

    if (action === 'test-queues') {
        modal = <TestQueuesModal keyPairs={keyPairs} />;
    } else if (action === 'logout') {
        modal = (
            <Modal
                onClose={cancel}
                save={<T t={t} k="log-out" />}
                disabled={loggingOut}
                waiting={loggingOut}
                title={<T t={t} k="log-out-modal.title" />}
                onCancel={cancel}
                onSave={logOut}
                saveType="warning"
            >
                <p>
                    <T
                        t={t}
                        k={
                            loggingOut
                                ? 'log-out-modal.logging-out'
                                : 'log-out-modal.text'
                        }
                    />
                </p>
            </Modal>
        );
    }

    return (
        <F>
            {modal}
            <CardContent>
                <div className="kip-mediator-settings">
                    <h2>
                        <T t={t} k="test-queues.title" />
                    </h2>
                    <p>
                        <T t={t} k="test-queues.text" />
                    </p>
                    <div className="kip-buttons">
                        <Button
                            type="success"
                            href="/mediator/settings/test-queues"
                        >
                            <T t={t} k="test-queues.button" />
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className="kip-buttons">
                    <Button type="warning" href="/mediator/settings/logout">
                        <T t={t} k="log-out" />
                    </Button>
                </div>
            </CardFooter>
        </F>
    );
};

const Settings = withActions(withRouter(withSettings(BaseSettings)), [
    keyPairs,
]);

export default Settings;
