// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import clsx from 'clsx';
import React from 'react';
import { Size } from 'types/Size';
import { Variant } from 'types/Variant';

export interface ButtonProps extends React.ComponentProps<'button'> {
    variant?: Variant;
    size?: Size;
    waiting?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className,
    disabled,
    variant = 'primary',
    size = 'md',
    waiting = false,
    ...props
}) => {
    return (
        <button
            disabled={disabled}
            className={clsx(
                'button',
                variant,
                size,
                { ['waiting']: waiting },
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
