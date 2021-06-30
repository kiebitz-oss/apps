// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef, useState } from 'react';
import { withActions, withRouter } from 'components';
import Wizard from './wizard';
import { providerData } from 'apps/provider/actions';

import './index.scss';

const Setup = withRouter(
    withActions(
        ({ route, router, providerDataAction }) => {
            const [initialized, setInitialized] = useState(false);

            useEffect(() => {
                if (initialized) return;
                setInitialized(true);
                let data;
                if (Object.keys(route.hashParams).length > 0)
                    data = route.hashParams;
                providerDataAction(data).then(pd => {
                    if (
                        route.handler.props.page === undefined &&
                        pd.data !== undefined &&
                        pd.data.submitted === true
                    )
                        router.navigateToUrl('/provider/schedule');
                });
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
    )
);

export default Setup;
