import React, { forwardRef } from 'react';
import { Select, SelectProps } from 'ui';
import { Field, FieldProps } from './Field';

export interface SelectFieldProps extends SelectProps, FieldProps {
    name: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
    ({ name, label, description, className, ...props }, ref) => {
        const id = !props.id ? name : props.id;

        return (
            <Field
                id={id}
                name={name}
                description={description}
                label={label}
                className={className}
            >
                <Select id={id} name={name} ref={ref} {...props} />
            </Field>
        );
    }
);

SelectField.displayName = 'SelectField';
