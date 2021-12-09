import React, { forwardRef } from 'react';
import { Field, FieldProps } from './Field';
import { Textarea, TextareaProps } from './Textarea';

export interface TextareaFieldProps extends TextareaProps, FieldProps {
    name: string;
    label?: string;
    description?: string;
}

export const TextareaField = forwardRef<
    HTMLTextAreaElement,
    TextareaFieldProps
>(({ name, label, description, className, ...props }, ref) => {
    const id = !props.id ? name : props.id;

    return (
        <Field id={id} name={name} label={label} description={description}>
            <Textarea
                id={id}
                name={name}
                className={className}
                {...props}
                ref={ref}
            />
        </Field>
    );
});

TextareaField.displayName = 'TextareaField';
