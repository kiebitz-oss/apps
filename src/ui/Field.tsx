import clsx from 'clsx';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from './Label';

export interface FieldProps {
    name: string;
    className?: string;
    id?: string;
    label?: string;
    description?: string;
    inline?: boolean;
    required?: boolean;
    as?: 'div' | 'label' | 'span' | 'p';
}

export const Field: React.FC<FieldProps> = ({
    children,
    name,
    className,
    label,
    description,
    id,
    inline,
    required,
    as,
    ...props
}) => {
    const Element = as || 'div';
    const { formState } = useFormContext();
    const error = formState?.errors?.[name]?.message;

    return (
        <Element
            className={clsx('field', { ['field-inline']: inline }, className)}
            {...props}
        >
            {label && (
                <Label id={id} required={required}>
                    {label}
                </Label>
            )}
            {children}
            {error && <div className="error">{error}</div>}
            {!error && description && <div className="hint">{description}</div>}
        </Element>
    );
};
