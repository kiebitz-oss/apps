// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import { withActions, withRouter } from 'components';
import { contactData, queueData, tokenData } from 'apps/user/actions';
import Wizard from './wizard';

import './index.scss';

const Setup = withRouter(
    withActions(
        ({
            router,
            contactDataAction,
            tokenDataAction,
            queueDataAction,
            route,
        }) => {
            const [initialized, setInitialized] = useState(false);

            useEffect(() => {
                if (initialized) return;
                setInitialized(true);
                tokenDataAction().then(td => {
                    if (td.data !== null)
                        router.navigateToUrl('/user/appointments');
                });
                if (Object.keys(route.hashParams).length > 0) {
                    contactDataAction(route.hashParams);
                    if (route.hashParams.zipCode !== undefined)
                        queueDataAction({ zipCode: route.hashParams.zipCode });
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
        [contactData, queueData, tokenData]
    )
);

export default Setup;
