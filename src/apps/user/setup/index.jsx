// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState } from 'react';
import { withActions } from 'components';
import { contactData, queueData, tokenData } from 'apps/user/actions';
import Wizard from './wizard';

import './index.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const SetupPage = ({ contactDataAction, tokenDataAction, queueDataAction }) => {
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();
    const { hash } = useLocation();
    const { page } = useParams();

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        tokenDataAction().then(td => {
            if (td.data !== null) navigate('/user/appointments');
        });

        if (hash.length > 0) {
            contactDataAction(hash);
            if (hash.zipCode !== undefined)
                queueDataAction({ zipCode: hash.zipCode });
        }
    });

    return <Wizard page={page || 'hi'} />;
};

export default withActions(SetupPage, [contactData, queueData, tokenData]);
