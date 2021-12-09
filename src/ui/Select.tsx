// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface Option {
    value: string | number;
    label: string;
}

export interface SelectProps extends React.ComponentPropsWithoutRef<'select'> {
    options: Option[];
    defaultOption?: string;
    label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ options, defaultOption, className, ...props }, ref) => {
        const id = !props.id ? props.name : props.id;

        return (
            <select
                id={id}
                className={clsx('select', className)}
                {...props}
                ref={ref}
            >
                {defaultOption && <option disabled>{defaultOption}</option>}

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={false}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }
);

Select.displayName = 'Select';
