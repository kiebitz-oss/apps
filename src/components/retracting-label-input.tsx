// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { forwardRef } from 'react';
import { Input, InputProps } from './form';
import classNames from 'helpers/classnames';
import { useFormContext } from 'react-hook-form';
import './retracting-label-input.scss';

export interface InputFieldProps extends InputProps {
    name: string;
    label: string;
    description?: string;
}

/**
 * An input field with a label that looks like a placeholder but retracts
 * to the top when an input is made.
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ children, name, label, description, className, ...props }, ref) => {
        const formContext = useFormContext();
        const id = props.id ? props.id : name;

        return (
            <div
                className={classNames('kip-retracting-label-input', className)}
            >
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
                    id={id}
                    className="kip-input"
                    name={name}
                    {...props}
                    ref={ref}
                />

                {formContext?.formState &&
                    formContext?.formState?.errors?.[name] && (
                        <p className="bulma-help bulma-is-info">
                            {formContext.formState.errors[name].message}
                        </p>
                    )}

                <p className="kip-description">{description}</p>

                {children}
            </div>
        );
    }
);

InputField.displayName = 'InputField';

export const RetractingLabelInput = InputField;
