import React from 'react';
import { Trans } from '@lingui/macro';
import { Message, BoxContent, Box, BoxFooter } from 'ui';
import { TokenData } from 'types';

interface NoInvitationsProps {
    tokenData: TokenData;
}

export const NoInvitations: React.FC<NoInvitationsProps> = ({ tokenData }) => {
    // in the first 10 minutes since the creation of the token we show a 'please wait'
    // message, as it can take some time for appointments to show up...
    const isNew =
        tokenData?.createdAt &&
        new Date(new Date(tokenData.createdAt).getTime() + 1000 * 60 * 10) >
            new Date();

    return (
        <Box>
            <BoxContent className="kip-no-invitations">
                {isNew && (
                    <>
                        <Message variant="success">
                            <Trans id="no-invitations.please-wait">
                                Deine Daten wurden im System gespeichert. Falls
                                Termine in deiner Nähe verfügbar sind, werden
                                diese in wenigen Minuten hier angezeigt.
                            </Trans>
                        </Message>
                    </>
                )}

                {!isNew && (
                    <>
                        <Message variant="warning">
                            <Trans id="no-invitations.notice">
                                Im Moment sind scheinbar keine Termine in Deiner
                                Umgebung verfügbar, oder leider bereits
                                ausgebucht. Bitte schau ab jetzt regelmäßig hier
                                vorbei. Sobald neue Termine in Deiner Nähe
                                verfügbar sind, werden sie Dir hier angezeigt.
                            </Trans>
                        </Message>
                    </>
                )}
            </BoxContent>

            <BoxFooter>
                <Message variant="info">
                    {/* <ButtonIcon icon="circle-notch fa-spin" /> &nbsp; */}
                    <Trans id="no-invitations.update-notice">
                        Diese Seite wird automatisch aktualisiert...
                    </Trans>
                </Message>
            </BoxFooter>
        </Box>
    );
};
