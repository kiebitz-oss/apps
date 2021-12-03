// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import classnames from 'helpers/classnames';
import './select.scss';

type SelectOption = {
    value: string | number;
    description: string;
};

interface SelectProps extends React.ComponentPropsWithoutRef<'select'> {
    options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
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
