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

import React, { useEffect, useState } from 'react';
import { b642buf } from 'helpers/conversion';
import {
    Modal,
    withActions,
    withSettings,
    Message,
    CardContent,
    CardFooter,
    Button,
    T,
    A,
    Tabs,
    Tab,
} from 'components';
import t from './translations.yml';
import './store-secrets.scss';

const StoreOnline = ({ settings, secret }) => {
    const [bookmarkModal, setBookmarkModal] = useState(false);
    const [copyModal, setCopyModal] = useState(false);

    let modal;

    const showBookmarkModal = () => {
        history.pushState(
            {},
            settings.t(t, 'store-secrets.restore.title'),
            `/user/restore#${secret},v0.1`
        );
        setBookmarkModal(true);
    };

    const hideBookmarkModal = () => {
        history.back();
        setBookmarkModal(false);
    };

    if (bookmarkModal)
        modal = (
            <Modal
                title={<T t={t} k="store-secrets.bookmark-modal.title" />}
                onClose={hideBookmarkModal}
            >
                <T t={t} k="store-secrets.bookmark-modal.text" />
            </Modal>
        );

    return (
        <React.Fragment>
            {modal}
            <p className="kip-secrets-notice">
                <T t={t} k="store-secrets.online.text" />
            </p>
            <div className="kip-secrets-box">
                {
                    <React.Fragment>
                        <div className="kip-uid">
                            <span>
                                <T t={t} k="store-secrets.secret" />
                            </span>
                            <code>{secret}</code>
                        </div>
                    </React.Fragment>
                }
            </div>
            <div className="kip-secrets-links">
                <A
                    className="bulma-button bulma-is-small"
                    onClick={showBookmarkModal}
                >
                    <T t={t} k="store-secrets.bookmark" />
                </A>
            </div>
        </React.Fragment>
    );
};

const StoreLocal = ({ data }) => {
    const blob = new Blob([b642buf(data)], {
        type: 'application/octet-stream',
    });
    const date = new Date().toLocaleDateString();
    return (
        <React.Fragment>
            <p className="kip-secrets-notice">
                <T t={t} k="store-secrets.local.text" />
            </p>
            <a
                className="bulma-button bulma-is-success"
                download={`geheime-daten.kiebitz`}
                href={URL.createObjectURL(blob)}
            >
                <T t={t} k="store-secrets.download" />
            </a>
        </React.Fragment>
    );
};

export default withActions(
    withSettings(({ settings }) => {
        const [url, setUrl] = useState(null);
        const [tab, setTab] = useState('online');

        let content;

        switch (tab) {
            case 'online':
                content = <StoreOnline settings={settings} secret={'foo'} />;
                break;
            case 'local':
                content = <StoreLocal settings={settings} data={'data'} />;
                break;
        }

        return (
            <React.Fragment>
                <CardContent>
                    <p className="kip-secrets-notice">
                        <T t={t} k="store-secrets.text" />
                    </p>
                    <Tabs>
                        <Tab
                            active={tab === 'online'}
                            onClick={() => setTab('online')}
                        >
                            <T t={t} k="store-secrets.online.title" />
                        </Tab>
                        <Tab
                            active={tab === 'local'}
                            onClick={() => setTab('local')}
                        >
                            <T t={t} k="store-secrets.local.title" />
                        </Tab>
                    </Tabs>
                    {content}
                </CardContent>
                <CardFooter>
                    <Button type="success" href={`/user/setup/finalize/${tab}`}>
                        <T t={t} k="wizard.continue" />
                    </Button>
                </CardFooter>
            </React.Fragment>
        );
    }),
    []
);
