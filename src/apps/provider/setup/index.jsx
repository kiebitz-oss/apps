// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { useProvider, useRouter, useEffectOnce } from 'hooks';
import { withRouter } from 'components';
import Wizard from './wizard';

import './index.scss';

const Setup = ({ route }) => {
    const provider = useProvider();
    const router = useRouter();

    useEffectOnce(() => {
        if (provider.data !== null && providerData.submittedAt)
            router.navigateToUrl('/provider/schedule');

        if (Object.keys(route.hashParams).length > 0)
            provider.data = route.hashParams; // pre-filled data
    });

    return (
        <React.Fragment>
            <Wizard
                route={route}
                page={route.handler.props.page || 'hi'}
                status={route.handler.props.status}
            />
        </React.Fragment>
    );
};

export default Setup;
