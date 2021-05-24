// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect } from 'react';
import Form from 'helpers/form';
import {
    withRouter,
    withSettings,
    withForm,
    withActions,
    WithLoader,
    withTimer,
    Form as FormComponent,
    FieldSet,
    RetractingLabelInput,
    ErrorFor,
    T,
    CardFooter,
    CardContent,
    Button,
} from 'components';
import { queues, keys, keyPairs, verifiedProviderData } from './actions';
import t from './translations.yml';
import './invitations.scss';

const Invitations = withTimer(
    withActions(
        ({
            keys,
            keysAction,
            keyPairs,
            timer,
            keyPairsAction,
            verifiedProviderData,
            verifiedProviderDataAction,
            invitationQueues,
            invitationQueuesAction,
            router,
        }) => {
            const [initialized, setInitialized] = useState(false);

            useEffect(() => {
                if (initialized) return;
                setInitialized(true);
                // we load all the necessary data
                verifiedProviderDataAction().then(pd =>
                    invitationQueuesAction(pd.data.signedData.json.queues)
                );
                keyPairsAction();
                keysAction();
            });

            const render = () => {
                return <div>test</div>;
            };

            // we wait until all resources have been loaded before we display the form
            return (
                <WithLoader
                    resources={[
                        keys,
                        keyPairs,
                        invitationQueues,
                        verifiedProviderData,
                    ]}
                    renderLoaded={render}
                />
            );
        },
        new Map([
            [verifiedProviderData],
            [queues, 'invitationQueues'],
            [keys],
            [keyPairs],
        ])
    ),
    2000
);

export default Invitations;
