// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Providers from './providers';

import {
    withSettings,
    withActions,
    Tabs,
    Tab,
    T,
    A,
    Message,
    FieldSet,
    Form,
    Input,
    Modal,
    CenteredCard,
    CardHeader,
    CardContent,
} from 'components';
import { keyPairs, validKeyPairs } from '../actions';
import t from './translations.yml';

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open('GET', file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    };
    rawFile.send(null);
}

function doSomething() {
    var file = document.getElementById('idexample');

    if (file.files.length) {
    }
}

const UploadKeyPairsModal = ({ keyPairsAction }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const readFile = () => {
        var reader = new FileReader();

        reader.onload = function(e) {
            const json = JSON.parse(e.target.result);
            keyPairsAction(json);
        };

        reader.readAsBinaryString(selectedFile);
    };

    return (
        <Modal
            save={<T t={t} k="upload-key-pairs.upload" />}
            onSave={readFile}
            saveDisabled={selectedFile === null}
            title={<T t={t} k="upload-key-pairs.title" />}
        >
            <T t={t} k="upload-key-pairs.notice" />
            <Form>
                <FieldSet>
                    <input
                        className="bulma-input"
                        type="file"
                        onChange={e => setSelectedFile(e.target.files[0])}
                    />
                </FieldSet>
            </Form>
        </Modal>
    );
};

const Dashboard = withActions(
    withSettings(
        ({
            route: {
                handler: {
                    props: { tab, action, id },
                },
            },
            settings,
            keyPairs,
            keyPairsAction,
            validKeyPairs,
            validKeyPairsAction,
        }) => {
            const [key, setKey] = useState(false);
            const [validKey, setValidKey] = useState(false);

            useEffect(() => {
                if (!key) {
                    setKey(true);
                    keyPairsAction();
                }
                if (!validKey && keyPairs !== undefined) {
                    setValidKey(true);
                    validKeyPairsAction(keyPairs);
                }
            });

            let content, modal;

            if (keyPairs !== undefined && keyPairs.data === null) {
                modal = <UploadKeyPairsModal keyPairsAction={keyPairsAction} />;
            }

            if (keyPairs !== undefined) {
                switch (tab) {
                    case 'settings':
                        content = <Settings />;
                        break;
                    case 'providers':
                        content = <Providers action={action} id={id} />;
                        break;
                }
            }

            let invalidKeyMessage;

            if (validKeyPairs !== undefined && validKeyPairs.valid === false) {
                invalidKeyMessage = (
                    <Message type="danger">
                        <T t={t} k="invalidKey" />
                    </Message>
                );
            }

            return (
                <CenteredCard size="fullwidth" tight>
                    <CardHeader>
                        <Tabs>
                            <Tab
                                active={tab === 'providers'}
                                href="/mediator/providers"
                            >
                                <T t={t} k="providers.title" />
                            </Tab>
                            <Tab
                                active={tab === 'queues'}
                                href="/mediator/queues"
                            >
                                <T t={t} k="queues.title" />
                            </Tab>
                            <Tab
                                active={tab === 'settings'}
                                href="/mediator/settings"
                            >
                                <T t={t} k="settings.title" />
                            </Tab>
                        </Tabs>
                    </CardHeader>
                    <CardContent>
                        {modal}
                        {content}
                    </CardContent>
                </CenteredCard>
            );
        }
    ),
    [keyPairs, validKeyPairs]
);

export default Dashboard;
