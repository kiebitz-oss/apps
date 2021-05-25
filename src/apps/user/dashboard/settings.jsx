// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import './settings.scss';
import t from './translations.yml';

import {
    withRouter,
    withSettings,
    Modal,
    Message,
    T,
    Button,
} from 'components';

const Settings = withSettings(
    withRouter(({ settings, action, router }) => {
        const [deleting, setDeleting] = useState(false);

        let deleteModal;

        const cancel = () => {
            router.navigateToUrl('/user/settings');
        };

        const deleteData = () => {
            setDeleting(true);
            const backend = settings.get('backend');
            backend.local.deleteAll('user::');
            setTimeout(() => {
                setDeleting(false);
                router.navigateToUrl('/user/deleted');
            }, 3000);
        };

        if (action === 'delete') {
            deleteModal = (
                <Modal
                    onClose={cancel}
                    save={<T t={t} k="delete" />}
                    disabled={deleting}
                    waiting={deleting}
                    title={<T t={t} k="delete-modal.title" />}
                    onCancel={cancel}
                    onSave={deleteData}
                    saveType="danger"
                >
                    <p>
                        <T
                            t={t}
                            k={
                                deleting
                                    ? 'delete-modal.deleting-text'
                                    : 'delete-modal.text'
                            }
                        />
                    </p>
                </Modal>
            );
        }

        return (
            <div className="kip-user-settings">
                {deleteModal}
                <h2>
                    <T t={t} k="save-and-restore" />
                </h2>
                <Button type="warning">
                    <T t={t} k="restore" />
                </Button>
                &nbsp;
                <Button type="sucess">
                    <T t={t} k="save" />
                </Button>
                <h2>
                    <T t={t} k="delete-data" />
                </h2>
                <Message type="danger">
                    <T t={t} k="delete-warning" />
                </Message>
                <Button type="danger" href="/user/settings/delete">
                    <T t={t} k="delete" />
                </Button>
            </div>
        );
    })
);

export default Settings;
