// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import { withActions } from 'components';
import Wizard from './wizard';
import { providerData } from 'apps/provider/actions';

import './index.scss';

const Setup = withActions(
    ({ route, providerDataAction }) => {
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
            if (initialized) return;
            setInitialized(true);
            if (Object.keys(route.hashParams).length > 0) {
                providerDataAction(route.hashParams);
            }
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
    },
    [providerData]
);

export default Setup;
