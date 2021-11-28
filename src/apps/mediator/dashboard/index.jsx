// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Providers from './providers';
import Stats from './stats';

import {
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
import { Trans } from '@lingui/macro';
import './index.scss';
import { useParams } from 'react-router';

const UploadKeyPairsModal = ({ keyPairsAction }) => {
    const [invalidFile, setInvalidFile] = useState(false);

    const readFile = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const json = JSON.parse(e.target.result);
            if (
                json.signing === undefined ||
                json.encryption === undefined ||
                json.provider === undefined
            )
                setInvalidFile(true);
            else keyPairsAction(json);
        };

        reader.readAsBinaryString(file);
    };

    let notice;

    if (invalidFile)
        notice = (
            <Message type="danger">
                <Trans id="upload-key-pairs.invalid-file">
                    Die von Ihnen gewählte Datei ist ungültig.
                </Trans>
            </Message>
        );
    else
        notice = (
            <Trans id="upload-key-pairs.notice">
                Bitte laden Sie die Datei mit Ihren geheimen
                Vermittlerschlüsseln.
            </Trans>
        );

    const footer = (
        <Form>
            <FieldSet>
                <label htmlFor="file-upload" className="custom-file-upload">
                    <Trans id="upload-key-pairs.input">Datei auswählen</Trans>
                    <input
                        id="file-upload"
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
            className="kip-upload-key-pairs"
            title={
                <Trans id="upload-key-pairs.title">
                    Geheime Schlüssel laden
                </Trans>
            }
        >
            {notice}
        </Modal>
    );
};

const DashboardPage = ({
    keyPairs,
    keyPairsAction,
    validKeyPairs,
    validKeyPairsAction,
}) => {
    const [key, setKey] = useState(false);
    const [validKey, setValidKey] = useState(false);
    const { tab, action, secondaryAction, id } = useParams();

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
                content = (
                    <Settings
                        action={action}
                        secondaryAction={secondaryAction}
                        id={id}
                    />
                );
                break;

            case 'stats':
                content = (
                    <Stats
                        action={action}
                        secondaryAction={secondaryAction}
                        id={id}
                    />
                );
                break;

            default:
            case 'providers':
                content = <Providers action={action} id={secondaryAction} />;
                break;
        }
    }

    let invalidKeyMessage;

    if (validKeyPairs !== undefined && validKeyPairs.valid === false) {
        invalidKeyMessage = (
            <Message type="danger">
                <Trans id="invalidKey">invalidKey MISSING</Trans>
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
                        <Trans id="providers.title">Anbieter</Trans>
                    </Tab>
                    <Tab active={tab === 'stats'} href="/mediator/stats">
                        <Trans id="stats.title">Statistiken</Trans>
                    </Tab>
                    <Tab active={tab === 'settings'} href="/mediator/settings">
                        <Trans id="settings.title">Einstellungen</Trans>
                    </Tab>
                </Tabs>
            </CardHeader>
            {modal}
            {content}
        </CenteredCard>
    );
};

export default withActions(DashboardPage, [keyPairs, validKeyPairs]);
