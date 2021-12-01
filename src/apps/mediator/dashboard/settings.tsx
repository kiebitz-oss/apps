// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import { keyPairs, testQueues } from '../actions';
import {
    withActions,
    Message,
    Modal,
    CardFooter,
    CardContent,
    Button,
} from 'components';
import { Trans } from '@lingui/macro';
import './settings.scss';
import { useNavigate } from 'react-router-dom';
import { useBackend } from 'hooks';

const TestQueuesModalBase: React.FC<any> = ({
    keyPairs,
    testQueues,
    testQueuesAction,
}) => {
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        testQueuesAction(keyPairs);
    });

    const readFile = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

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
                <Trans id="upload-queues.invalid-file">
                    Die erzeugten Queue-Schlüssel sind nicht korrekt und können
                    mit Ihrem Vermittler-Schlüssel nicht entschlüsselt werden.
                </Trans>
            </Message>
        );
    else if (status === 'valid')
        notice = (
            <Message type="success">
                <Trans id="upload-queues.valid-file">
                    Die erzeugten Queue-Schlüssel sind korrekt und können mit
                    Ihrem Vermittler-Schlüssel entschlüsselt werden.
                </Trans>
            </Message>
        );
    else
        notice = (
            <Trans id="upload-queues.notice">
                Bitte laden Sie die Queues-Datei, die mit dem "kiebitz" Kommando
                erstellt wurde. Die Datei wird dann auf Korrektheit geprüft.
            </Trans>
        );

    const footer = (
        <form name="upload-queues" className="kip-form">
            <label htmlFor="file-upload" className="custom-file-upload">
                <Trans id="upload-queues.input">Datei wählen</Trans>
                <input
                    id="file-upload"
                    disabled={keyPairs === undefined || keyPairs.data === null}
                    className="bulma-input"
                    type="file"
                    onChange={e => readFile(e)}
                />
            </label>
        </form>
    );

    return (
        <Modal
            footer={footer}
            onClose={() => navigate('/mediator/settings')}
            className="kip-upload-file"
            title={<Trans id="upload-queues.title">Queues-Datei laden</Trans>}
        >
            {notice}
        </Modal>
    );
};

const TestQueuesModal = withActions(TestQueuesModalBase, [testQueues]);

const BaseSettings: React.FC<any> = ({ keyPairs, keyPairsAction, action }) => {
    let modal;

    const [initialized, setInitialized] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const backend = useBackend();

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        keyPairsAction();
    });

    const cancel = () => {
        navigate('/mediator/settings');
    };

    const logOut = () => {
        setLoggingOut(true);

        backend.local.deleteAll('mediator::');
        navigate('/mediator/logged-out');
    };

    if (action === 'test-queues') {
        modal = <TestQueuesModal keyPairs={keyPairs} />;
    } else if (action === 'logout') {
        modal = (
            <Modal
                onClose={cancel}
                save={<Trans id="log-out">Abmelden</Trans>}
                disabled={loggingOut}
                waiting={loggingOut}
                title={<Trans id="log-out-modal.title">Abmelden</Trans>}
                onCancel={cancel}
                onSave={logOut}
                saveType="warning"
            >
                <p>
                    {loggingOut ? (
                        <Trans id="log-out-modal.logging-out">
                            log-out-modal.logging-out MISSING
                        </Trans>
                    ) : (
                        <Trans id="log-out-modal.text">
                            log-out-modal.text MISSING
                        </Trans>
                    )}
                </p>
            </Modal>
        );
    }

    return (
        <>
            {modal}
            <CardContent>
                <div className="kip-mediator-settings">
                    <h2>
                        <Trans id="test-queues.title">Queue-Datei testen</Trans>
                    </h2>
                    <p>
                        <Trans id="test-queues.text">
                            Hier können Sie Queues-Dateien testen, die Sie mit
                            dem "kiebitz" Tool erstellt haben. Hierdurch können
                            Sie sicherstellen, dass die Dateien korrekt sind,
                            bevor Sie diese in ein Backend hochladen.
                        </Trans>
                    </p>
                    <div className="kip-buttons">
                        <Button
                            type="success"
                            href="/mediator/settings/test-queues"
                        >
                            <Trans id="test-queues.button">Testen</Trans>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className="kip-buttons">
                    <Button type="warning" href="/mediator/settings/logout">
                        <Trans id="log-out">Abmelden</Trans>
                    </Button>
                </div>
            </CardFooter>
        </>
    );
};

const Settings = withActions(BaseSettings, [keyPairs]);

export default Settings;
