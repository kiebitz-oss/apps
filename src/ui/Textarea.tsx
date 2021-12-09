import clsx from 'clsx';
import React, { forwardRef } from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        const id = !props.id ? props.name : props.id;

        return (
            <textarea
                id={id}
                className={clsx('textarea', className)}
                {...props}
                ref={ref}
            />
        );
    }
);

Textarea.displayName = 'Textarea';
