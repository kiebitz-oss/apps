// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { withActions } from 'components';
import { contactData, queueData, tokenData } from 'apps/user/actions';
import { useNavigate } from 'react-router-dom';
import { defineMessage } from '@lingui/macro';
import { useEffectOnce } from 'react-use';
import Wizard from './wizard';
// import './index.scss';
import { StepHi } from './StepHi';
import StepEnterContactData from './StepEnterContactData';
import StepFinalize from './StepFinalize';
import StepStoreSecrets from './StepStoreSecrets';

// const pages = ['hi', 'enter-contact-data', 'finalize', 'store-secrets'];

const titles = {
    hi: defineMessage({
        id: 'wizard.steps.hi',
        message: "Los geht's!",
    }),
    'enter-contact-data': defineMessage({
        id: 'wizard.steps.enter-contact-data',
        message: 'Registrierungsdaten eingeben',
    }),
    finalize: defineMessage({
        id: 'wizard.steps.finalize',
        message: 'Daten zu Impfung eingeben',
    }),
    'store-secrets': defineMessage({
        id: 'wizard.steps.store-secrets',
        message: 'Sicherheitscode notieren',
    }),
};

const SetupPage: React.FC<any> = ({ tokenDataAction }) => {
    const navigate = useNavigate();

    useEffectOnce(() => {
        tokenDataAction().then((td: any) => {
            if (td.data !== null) {
                navigate('/user/appointments');
            }
        });
    });

    return (
        <Wizard titles={titles}>
            <StepHi />
            <StepEnterContactData />
            <StepFinalize />
            <StepStoreSecrets />
        </Wizard>
    );
};

export default withActions(SetupPage, [contactData, queueData, tokenData]);
