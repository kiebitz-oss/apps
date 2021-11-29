// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import PropTypes from 'prop-types';
import { T, Card, CardHeader, CardContent } from 'components';
import './summary-box.scss';
import { Trans } from '@lingui/macro';

const formatNumbers = n => n;

const SummaryBox = ({ open, booked, active }) => (
    <Card className="kip-is-fullheight kip-is-fullwidth kip-summary-box" flex>
        <CardHeader>
            <h2>
                <Trans id="summary" />
            </h2>
        </CardHeader>
        <CardContent>
            <p className="kip-summary-box-number">
                <span>{formatNumbers(open)}</span>
                <Trans id="open" />
            </p>
            <p className="kip-summary-box-number">
                <span>{formatNumbers(booked)}</span>
                <Trans id="booked" />
            </p>
            <p className="kip-summary-box-number">
                <span>{formatNumbers(active)}</span>
                <Trans id="active" />
            </p>
        </CardContent>
    </Card>
);

export default SummaryBox;
