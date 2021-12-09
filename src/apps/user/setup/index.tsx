// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { Wizard } from 'ui';
import { StepFinalize } from './StepFinalize';
import { StepStoreSecrets } from './StepStoreSecrets';

const SetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { page } = useParams();

    useEffectOnce(() => {
        const tokenData = localStorage.getItem('local::user::tokenData');

        if (tokenData !== null) {
            navigate('/user/appointments');
        }
    });

    return (
        <Wizard step={page || 'hi'}>
            {/* <StepHi /> */}
            {/* <StepEnterContactData /> */}
            <StepFinalize />
            <StepStoreSecrets />
        </Wizard>
    );
};

export default SetupPage;
