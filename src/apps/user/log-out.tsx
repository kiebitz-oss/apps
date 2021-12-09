import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Box, Button, BoxHeader, BoxContent, BoxFooter, Title } from 'ui';
import { backupData, userSecret } from './actions';
import { useBackend } from 'hooks';
import { useNavigate } from 'react-router';
import { withActions } from 'components';
import { SecretsBox } from 'apps/common/SecretBox';

export const LogOutBoxBase: React.FC<any> = ({
    userSecret,
    backupDataAction,
}) => {
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const backend = useBackend();

    const logOut = () => {
        setLoggingOut(true);

        // we perform a backup before logging the user out...
        backupDataAction(userSecret.data, 'logout').then(() => {
            backend.local.deleteAll('user::');
            setLoggingOut(false);
            navigate('/user/logged-out');
        });
    };

    return (
        <Box>
            <BoxHeader>
                <Title>
                    <Trans id="log-out-Box.title">Abmelden</Trans>
                </Title>
            </BoxHeader>

            <BoxContent>
                <p>
                    <Trans
                        id={
                            loggingOut
                                ? 'log-out-Box.logging-out'
                                : 'log-out-Box.text'
                        }
                    >
                        {loggingOut
                            ? 'Bitte warten, Sie werden abgemeldet...'
                            : 'Möchtest Du Dich wirklich abmelden? Bitte stelle vorher sicher, dass Du Deinen Sicherheitscode notiert hast. Nur mit diesem Code kannst Du Dich später wieder anmelden.'}
                    </Trans>
                </p>

                {userSecret?.data && <SecretsBox secret={userSecret.data} />}
            </BoxContent>

            <BoxFooter>
                <Button type="button" variant="primary" onClick={logOut}>
                    <Trans id="log-out">Abmelden</Trans>
                </Button>
            </BoxFooter>
        </Box>
    );
};

export default withActions(LogOutBoxBase, [userSecret, backupData]);
