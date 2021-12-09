import React, { ChangeEventHandler, useState } from 'react';
import { Trans } from '@lingui/macro';
import {
    Message,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Title,
} from 'ui';

export const UploadKeyPairsModal: React.FC<{ keyPairsAction: any }> = ({
    keyPairsAction,
}) => {
    const [invalidFile, setInvalidFile] = useState(false);

    const uploadFile: ChangeEventHandler<HTMLInputElement> = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                if (e.target?.result && typeof e.target.result === 'string') {
                    const json = JSON.parse(e.target.result);

                    if (
                        json.signing === undefined ||
                        json.encryption === undefined ||
                        json.provider === undefined
                    ) {
                        setInvalidFile(true);
                    } else {
                        keyPairsAction(json);
                    }
                }
            };

            reader.readAsBinaryString(file);
        }
    };

    return (
        <Modal>
            <ModalHeader>
                <Title>
                    <Trans id="upload-key-pairs.title">
                        Geheime Schlüssel laden
                    </Trans>
                </Title>
            </ModalHeader>

            <ModalContent>
                {invalidFile && (
                    <Message variant="danger">
                        <Trans id="upload-key-pairs.invalid-file">
                            Die von Ihnen gewählte Datei ist ungültig.
                        </Trans>
                    </Message>
                )}

                {!invalidFile && (
                    <Trans id="upload-key-pairs.notice">
                        Bitte laden Sie die Datei mit Ihren geheimen
                        Vermittlerschlüsseln.
                    </Trans>
                )}
            </ModalContent>

            <ModalFooter>
                <form>
                    <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer button primary md"
                    >
                        <Trans id="upload-key-pairs.input">
                            Datei auswählen
                        </Trans>

                        <input
                            id="file-upload"
                            className="absolute inset-0 w-auto opacity-0 -z-10"
                            type="file"
                            onChange={uploadFile}
                        />
                    </label>
                </form>
            </ModalFooter>
        </Modal>
    );
};
