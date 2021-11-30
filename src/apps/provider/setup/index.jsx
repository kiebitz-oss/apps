// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import { withActions } from 'components';
import Wizard from './wizard';
import { providerData } from 'apps/provider/actions';
import { useNavigate, useParams, useLocation } from "react-router";

import './index.scss';

const Setup = withActions(
    ({ providerDataAction }) => {
        const [initialized, setInitialized] = useState(false);
        const { page, status } = useParams();
        const navigate = useNavigate();
        const { hash } = useLocation();


        useEffect(() => {
            if (initialized) return;
            setInitialized(true);

            providerDataAction(hash).then(pd => {
                if (page === undefined && pd.data?.submittedAt !== undefined)
                    navigate('/provider/schedule');
            });
        });

        return (
            <React.Fragment>
                <Wizard
                    page={page || 'hi'}
                    status={status}
                />
            </React.Fragment>
        );
    },
    [providerData]
);

export default Setup;
