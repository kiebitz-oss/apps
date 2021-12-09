import React from 'react';
import { Trans } from '@lingui/macro';
import { keyPairs } from 'apps/provider/actions';
import { useNavigate } from 'react-router';
import {
    Button,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Title,
    Text,
} from 'ui';

interface ConfirmProviderModal {
    provider: any;
}

export const ConfirmProviderModal: React.FC<ConfirmProviderModal> = ({
    provider,
    confirmProviderAction,
    getData,
}) => {
    const navigate = useNavigate();
    const closeModal = () => navigate('/mediator/providers');

    const doConfirmProvider = () => {
        confirmProviderAction(provider, keyPairs.data).then(() => {
            getData();
            navigate('/mediator/providers');
        });
    };

    return (
        <Modal onClose={closeModal}>
            <ModalHeader>
                <Title>
                    <Trans id="providers.edit">Anbieter bearbeiten</Trans>
                </Title>
            </ModalHeader>

            <ModalContent>
                <Text>
                    <Trans id="providers.confirmText">
                        Wollen Sie den Anbieter wirklich freischalten?
                    </Trans>
                </Text>

                <table className="table striped">
                    <thead>
                        <tr>
                            <th>
                                <Trans id="provider-data.field">Feld</Trans>
                            </th>
                            <th>
                                <Trans id="provider-data.value">Wert</Trans>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>
                                <Trans id="provider-data.name">Name</Trans>
                            </th>
                            <td>{provider.data.name}</td>
                        </tr>
                        <tr>
                            <th>
                                <Trans id="provider-data.street">Straße</Trans>
                            </th>
                            <td>{provider.data.street}</td>
                        </tr>
                        <tr>
                            <th>
                                <Trans id="provider-data.city">Stadt</Trans>
                            </th>
                            <td>{provider.data.city}</td>
                        </tr>
                        <tr>
                            <th>
                                <Trans id="provider-data.zip-code">
                                    Postleitzahl
                                </Trans>
                            </th>
                            <td>{provider.data.zipCode}</td>
                        </tr>
                        <tr>
                            <th>
                                <Trans id="provider-data.email">E-Mail</Trans>
                            </th>
                            <td>{provider.data.email}</td>
                        </tr>
                        <tr>
                            <th>
                                <Trans id="provider-data.phone">
                                    Telefonnummer
                                </Trans>
                            </th>
                            <td>{provider.data.phone}</td>
                        </tr>
                        <tr>
                            <th>
                                <Trans id="provider-data.description">
                                    Beschreibung
                                </Trans>
                            </th>
                            <td>{provider.data.description}</td>
                        </tr>
                    </tbody>
                </table>
            </ModalContent>

            <ModalFooter>
                <Button onClick={doConfirmProvider}>
                    <Trans id="providers.confirm">Anbieter freischalten</Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};
