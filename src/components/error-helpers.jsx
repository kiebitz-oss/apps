// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import PropTypes from 'prop-types';
import { Message } from './message';

export const mergeErrors = (errors, newErrors) => {
    for (const key of Object.keys(newErrors)) {
        if (errors[key] === undefined) errors[key] = newErrors[key];
        else errors[key] = errors[key].concat(newErrors[key]);
    }
};

export const ErrorMessage = ({ error }) => {
    if (error === undefined || error.message === undefined) return null;
    return <Message type="danger">{error.message}</Message>;
};
ErrorMessage.propTypes = {
    error: PropTypes.shape({
        message: PropTypes.node,
    }),
};
