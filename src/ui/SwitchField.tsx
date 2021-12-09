import clsx from 'clsx';
import React, { forwardRef } from 'react';
import { Switch, SwitchProps } from 'ui';
import { Field, FieldProps } from './Field';

export interface SwitchFieldProps extends SwitchProps, FieldProps {
    name: string;
    label?: string;
    description?: string;
}

export const SwitchField = forwardRef<HTMLInputElement, SwitchFieldProps>(
    ({ label, name, description, className, ...props }, ref) => {
        const id = !props.id ? name : props.id;

        return (
            <Field
                id={id}
                name={name}
                className={clsx(className, 'gap-4 items-center')}
                as="label"
                inline
            >
                <Switch
                    id={id}
                    name={name}
                    label={label}
                    {...props}
                    ref={ref}
                />
            </Field>
        );
    }
);

SwitchField.displayName = 'SwitchField';
