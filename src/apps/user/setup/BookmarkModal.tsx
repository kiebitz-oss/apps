// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Trans } from '@lingui/macro';
import { useNavigate } from 'react-router';
import { Modal, ModalContent, ModalHeader } from 'ui';

export const BookmarkModal: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Modal onClose={() => navigate('/user/setup/store-secrets')}>
            <ModalHeader>
                <Trans id="store-secrets.bookmark-modal.title">
                    Lesezeichen erstellen
                </Trans>
            </ModalHeader>

            <ModalContent>
                <Trans id="store-secrets.bookmark-modal.text">
                    Nutze Dein Browser-Menü um ein Lesezeichen für diese Seite
                    zu erstellen. Du kannst dieses Lesezeichen öffnen, um Deinen
                    Sicherheitscode wiederherzustellen.
                </Trans>
            </ModalContent>
        </Modal>
    );
};
