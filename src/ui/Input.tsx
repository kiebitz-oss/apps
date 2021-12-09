import clsx from 'clsx';
import React, { forwardRef } from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        const id = !props.id ? props.name : props.id;

        return (
            <input
                id={id}
                className={clsx('input', className)}
                {...props}
                ref={ref}
            />
        );
    }
);

Input.displayName = 'Input';
