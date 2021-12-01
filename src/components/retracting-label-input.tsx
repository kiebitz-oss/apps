// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { forwardRef } from 'react';
import { Input } from './form';
import classNames from 'helpers/classnames';
import './retracting-label-input.scss';

interface InputFieldProps extends React.HTMLAttributes<HTMLInputElement> {
    name: string;
    label: string;
    description: string;
}

/**
 * An input field with a label that looks like a placeholder but retracts
 * to the top when an input is made.
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ children, name, label, description, className, ...props }, ref) => (
        <div className={classNames('kip-retracting-label-input', className)}>
            {label && (
                <label
                    id={`kip-${name}-label`}
                    htmlFor={name}
                    className="kip-label"
                >
                    {label}
                </label>
            )}

            <Input
                aria-labelledby={name + 'label'}
                className="kip-input"
                name={name}
                {...props}
                ref={ref}
            />
            <p className="kip-description">{description}</p>
            {children}
        </div>
    )
);

InputField.displayName = 'InputField';

export const RetractingLabelInput = InputField;
