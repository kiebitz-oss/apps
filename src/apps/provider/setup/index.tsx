// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { withActions } from 'components';

import { providerData } from 'apps/provider/actions';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useEffectOnce } from 'react-use';
import { Wizard } from 'ui';
import { StepHi } from './StepHi';
import { StepStoreSecrets } from './StepStoreSecrets';
import { StepProviderData } from './StepProviderData';
import { StepVerify } from './StepVerify';

const SetupPage: React.FC<any> = ({ providerDataAction }) => {
    const navigate = useNavigate();
    const { page } = useParams();
    const { hash } = useLocation();

    useEffectOnce(() => {
        providerDataAction(hash).then((pd: any) => {
            if (page === undefined && pd.data?.submittedAt !== undefined)
                navigate('/provider/schedule');
        });
    });

    return (
        <Wizard step={page || 'hi'}>
            {/* <StepHi /> */}
            <StepProviderData />
            <StepStoreSecrets />
            <StepVerify />
        </Wizard>
    );
};

export default withActions(SetupPage, [providerData]);
