// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import { withActions } from 'components';
import { contactData } from 'apps/user/actions';
import Wizard from './wizard';

import './index.scss';

const Setup = withActions(
    ({ contactDataAction, route }) => {
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
            if (initialized) return;
            setInitialized(true);
            if (Object.keys(route.hashParams).length > 0) {
                contactDataAction(route.hashParams);
            }
        });

        return (
            <React.Fragment>
                <Wizard
                    route={route}
                    type={route.handler.props.type || 'print'}
                    page={route.handler.props.page || 'hi'}
                />
            </React.Fragment>
        );
    },
    [contactData]
);

export default Setup;
