// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { forwardRef } from 'react';

import classnames from 'helpers/classnames';
import { Button } from './button';
import './form.scss';

type InputProps = React.HTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                className={classnames('kip-input', className)}
                {...props}
                ref={ref}
            />
        );
    }
);

Input.displayName = 'Input';

type TextAreaProps = React.HTMLAttributes<HTMLTextAreaElement>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={classnames('kip-textarea', className)}
                {...props}
                ref={ref}
            />
        );
    }
);

TextArea.displayName = 'TextArea';

interface SubmitFieldProps extends React.HTMLAttributes<HTMLButtonElement> {
    title?: string;
}

export const SubmitField: React.FC<SubmitFieldProps> = ({
    children,
    title,
    className,
    ...props
}) => (
    <div className="bulma-field">
        <div className={classnames('bulma-control', className)}>
            <Button
                className="bulma-button bulma-is-primary"
                htmlType="submit"
                {...props}
            >
                {children}
                {title}
            </Button>
        </div>
    </div>
);
