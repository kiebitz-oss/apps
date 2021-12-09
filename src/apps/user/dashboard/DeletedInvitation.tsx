import React from 'react';
import { Trans } from '@lingui/macro';
import { withActions } from 'components';
import { Button, Message, BoxFooter } from 'ui';
import { confirmDeletion, acceptedInvitation } from 'apps/user/actions';

const DeletedInvitationBase: React.FC<any> = ({
    confirmDeletionAction,
    acceptedInvitationAction,
}) => {
    const onClick = () =>
        confirmDeletionAction().then(acceptedInvitationAction);

    return (
        <>
            <Message variant="danger">
                <Trans id="invitation-accepted.deleted">
                    Der Termin wurde vom Arzt gelöscht. Sorry! Du kannst zurück
                    zur Terminvergabe gehen, um neue Terminvorschläge zu
                    erhalten.
                </Trans>
            </Message>

            <BoxFooter>
                <Button variant="warning" onClick={onClick}>
                    <Trans id="invitation-accepted.confirm-deletion">
                        Zurück zur Terminvergabe
                    </Trans>
                </Button>
            </BoxFooter>
        </>
    );
};

export const DeletedInvitation = withActions(DeletedInvitationBase, [
    confirmDeletion,
    acceptedInvitation,
]);
