import { Trans } from '@lingui/macro';
import { Modal } from 'components';
import React from 'react';

export const BookmarkModal: React.FC = () => {
    return (
        <Modal
            title={
                <Trans id="store-secrets.bookmark-modal.title">
                    Lesezeichen erstellen
                </Trans>
            }
            onClose={hideBookmarkModal}
        >
            <Trans id="store-secrets.bookmark-modal.text">
                Nutze Dein Browser-Menü um ein Lesezeichen für diese Seite zu
                erstellen. Du kannst dieses Lesezeichen öffnen, um Deinen
                Sicherheitscode wiederherzustellen.
            </Trans>
        </Modal>
    );
};
