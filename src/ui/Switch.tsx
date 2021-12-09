// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface SwitchProps extends React.ComponentProps<'input'> {
    defaultChecked?: boolean;
    label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ label, className, ...props }, ref) => {
        return (
            <>
                <input
                    type="checkbox"
                    role="switch"
                    className={clsx('switch', className)}
                    {...props}
                    ref={ref}
                />
                <span className="select-none">{label}</span>
            </>
        );
    }
);

Switch.displayName = 'Switch';
