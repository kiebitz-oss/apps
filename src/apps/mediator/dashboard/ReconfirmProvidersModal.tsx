import React from 'react';
import { Trans } from '@lingui/macro';
import { keyPairs } from 'apps/provider/actions';
import { withActions } from 'components';
import { useNavigate } from 'react-router';
import { Button, Modal, ModalContent, ModalFooter, ModalHeader } from 'ui';
import {
    reconfirmProviders,
    verifiedProviders,
    confirmProvider,
} from 'apps/mediator/actions';

export const ReconfirmProvidersModalBase: React.FC<any> = ({
    keyPairs,
    reconfirmProviders,
    reconfirmProvidersAction,
    verifiedProviders,
}) => {
    const navigate = useNavigate();
    const closeModal = () => navigate('/mediator/providers');

    const doReconfirmProviders = () => {
        reconfirmProvidersAction(verifiedProviders.data, keyPairs.data);
    };

    return (
        <Modal onClose={closeModal}>
            <ModalHeader>
                <Trans id="providers.reconfirm">Alle neu bestätigen</Trans>
            </ModalHeader>
            <ModalContent>
                <div className="kip-provider-data">
                    {(reconfirmProviders.status === 'inProgress' && (
                        <Trans id="providers.reconfirmProgressText">
                            Bestätige Anbieter {reconfirmProviders.i} von{' '}
                            {reconfirmProviders.n}...
                        </Trans>
                    )) || (
                        <Trans id="providers.reconfirmText">
                            Wollen Sie alle bestätigten Anbieter neu bestätigen?
                        </Trans>
                    )}
                </div>
            </ModalContent>
            <ModalFooter>
                <Button
                    onClick={doReconfirmProviders}
                    disabled={reconfirmProviders.status === 'inProgress'}
                >
                    <Trans id="providers.reconfirm">Alle neu bestätigen'</Trans>
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export const ReconfirmProvidersModal = withActions(
    ReconfirmProvidersModalBase,
    [reconfirmProviders, verifiedProviders, keyPairs, confirmProvider]
);
