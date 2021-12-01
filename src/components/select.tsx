// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { forwardRef } from 'react';
import classnames from 'helpers/classnames';
import './select.scss';

type SelectOption = {
    value: string;
    description: string;
};

interface SelectProps extends React.HTMLAttributes<HTMLSelectElement> {
    options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, ...props }, ref) => {
        return (
            <select
                className={classnames('kip-select', className)}
                {...props}
                ref={ref}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.description}
                    </option>
                ))}
            </select>
        );
    }
);

Select.displayName = 'Select';

export const RichSelect = Select;
