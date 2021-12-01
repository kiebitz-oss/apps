// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Input } from './form';
import classNames from 'helpers/classnames';
import './retracting-label-input.scss';

/**
 * An input field with a label that looks like a placeholder but retracts
 * to the top when an input is made.
 */
export const RetractingLabelInput = forwardRef(
    ({ children, name, label, description, className, ...props }, ref) => (
        <span className={classNames('kip-retracting-label-input' + className)}>
            <Input
                aria-labelledby={name + 'label'}
                {...props}
                className="kip-input"
                placeholder=" " // Used to determine if the input is empty; needs to be a space for Chrome
                ref={ref}
            />
            <span
                id={`kip-${name}-label`}
                aria-hidden="true"
                className="kip-label"
            >
                {label}
            </span>
            <p className="kip-description">{description}</p>
            {children}
        </span>
    )
);

RetractingLabelInput.displayName = 'RetractingLabelInput';

RetractingLabelInput.propTypes = {
    className: '',
    label: '',
};

RetractingLabelInput.propTypes = {
    /* Class name to apply on the input */
    className: PropTypes.string,
    /* A describing label for the input */
    label: PropTypes.node.isRequired,
};
