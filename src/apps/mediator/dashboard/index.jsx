// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import Providers from './providers';
import Stats from './stats';

import { useMediator, useSettings } from 'hooks';
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
import './index.scss';

const UploadKeyPairsModal = () => {
    const mediator = useMediator();

    const [invalidFile, setInvalidFile] = useState(false);

    const readFile = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const json = JSON.parse(e.target.result);
            if (
                json.signing === undefined ||
                json.encryption === undefined ||
                json.provider === undefined
            )
                setInvalidFile(true);
            else mediator.keyPairs = json;
        };

        reader.readAsBinaryString(file);
    };

    let notice;

    if (invalidFile)
        notice = (
            <Message type="danger">
                <T t={t} k="upload-key-pairs.invalid-file" />
            </Message>
        );
    else notice = <T t={t} k="upload-key-pairs.notice" />;

    const footer = (
        <Form>
            <FieldSet>
                <label htmlFor="file-upload" className="custom-file-upload">
                    <T t={t} k="upload-key-pairs.input" />
                    <input
                        id="file-upload"
                        className="bulma-input"
                        type="file"
                        onChange={(e) => readFile(e)}
                    />
                </label>
            </FieldSet>
        </Form>
    );
    return (
        <Modal
            footer={footer}
            className="kip-upload-key-pairs"
            title={<T t={t} k="upload-key-pairs.title" />}
        >
            {notice}
        </Modal>
    );
};

const Dashboard = ({
    route: {
        handler: {
            props: { tab, action, secondaryAction, id },
        },
    },
}) => {
    const settings = useSettings();
    const mediator = useMediator();

    let content, modal;

    if (mediator.keyPairs === null) {
        modal = <UploadKeyPairsModal />;
    }

    if (mediator.keyPairs !== null) {
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
            case 'providers':
                content = <Providers action={action} id={secondaryAction} />;
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
        }
    }

    let invalidKeyMessage;

    // to do: implement validation flow
    /*
    if (mediator.validKeyPairs !== undefined && validKeyPairs.valid === false) {
        invalidKeyMessage = (
            <Message type="danger">
                <T t={t} k="invalidKey" />
            </Message>
        );
    }
    */

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
                    <Tab active={tab === 'stats'} href="/mediator/stats">
                        <T t={t} k="stats.title" />
                    </Tab>
                    <Tab active={tab === 'settings'} href="/mediator/settings">
                        <T t={t} k="settings.title" />
                    </Tab>
                </Tabs>
            </CardHeader>
            {modal}
            {content}
        </CenteredCard>
    );
};

export default Dashboard;
