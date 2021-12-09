import React, { ChangeEventHandler } from 'react';
import { Trans } from '@lingui/macro';
import { withActions } from 'components';
import { Message, Modal, Title } from 'ui';
import { useNavigate } from 'react-router';
import { useEffectOnce } from 'react-use';
import { testQueues } from 'apps/mediator/actions';
import { ModalContent, ModalFooter, ModalHeader } from 'ui';

const TestQueuesModalBase: React.FC<any> = ({
    keyPairs,
    testQueues,
    testQueuesAction,
}) => {
    const navigate = useNavigate();

    useEffectOnce(() => {
        testQueuesAction(keyPairs);
    });

    const readFile: ChangeEventHandler<HTMLInputElement> = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            reader.readAsBinaryString(file);

            reader.onload = (e) => {
                const json = JSON.parse(e.target?.result?.toString() || '');

                testQueuesAction(keyPairs, json);
            };
        }
    };

    const { status } = testQueues;

    return (
        <Modal onClose={() => navigate('/mediator/settings')}>
            <ModalHeader>
                <Title>
                    <Trans id="upload-queues.title">Queues-Datei laden</Trans>
                </Title>
            </ModalHeader>

            <ModalContent>
                {status === 'invalid' && (
                    <Message variant="danger">
                        <Trans id="upload-queues.invalid-file">
                            Die erzeugten Queue-Schlüssel sind nicht korrekt und
                            können mit Ihrem Vermittler-Schlüssel nicht
                            entschlüsselt werden.
                        </Trans>
                    </Message>
                )}
                {status === 'valid' && (
                    <Message variant="success">
                        <Trans id="upload-queues.valid-file">
                            Die erzeugten Queue-Schlüssel sind korrekt und
                            können mit Ihrem Vermittler-Schlüssel entschlüsselt
                            werden.
                        </Trans>
                    </Message>
                )}

                {status !== 'valid' && status !== 'invalid' && (
                    <Trans id="upload-queues.notice">
                        Bitte laden Sie die Queues-Datei, die mit dem "kiebitz"
                        Kommando erstellt wurde. Die Datei wird dann auf
                        Korrektheit geprüft.
                    </Trans>
                )}
            </ModalContent>

            <ModalFooter>
                <form name="upload-queues">
                    <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer button primary md"
                    >
                        <Trans id="upload-queues.input">Datei wählen</Trans>

                        <input
                            id="file-upload"
                            disabled={!keyPairs?.data}
                            className="absolute inset-0 w-auto opacity-0 -z-10"
                            type="file"
                            onChange={readFile}
                        />
                    </label>
                </form>
            </ModalFooter>
        </Modal>
    );
};

export const TestQueuesModal = withActions(TestQueuesModalBase, [testQueues]);
