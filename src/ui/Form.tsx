// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import clsx from 'clsx';
import React from 'react';

export type FormProps = React.ComponentProps<'form'>;

export const Form: React.FC<FormProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <form className={clsx('form', className)} {...props}>
            {children}
        </form>
    );
};
