import cn from 'classnames';
import { get } from 'lodash';
import React, { memo, ReactElement, useMemo } from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';

interface Props {
    children: JSX.Element;
    name: string;
    hint?: string;
    label?: string;
    isRequired?: boolean;
    labelHidden?: boolean;
    isPrimitiveField?: boolean;
    pattern?: RegExp;
}

const errorMessages = {
    pattern: 'Das Format der Eingabe ist nicht korrekt.',
    required: 'Dies ist ein Pflichtfeld.',
};

export const Field = memo((props: Props): ReactElement => {
    const { children: child, name, hint, label, isRequired = false, labelHidden, isPrimitiveField, pattern } = props;
    const {
        formState: { errors },
        register,
        control,
    } = useFormContext();

    const fieldError = get(errors, name, null);

    const registerOptions: RegisterOptions = useMemo(
        () => ({
            required: isRequired,
            pattern,
        }),
        []
    );

    const FormComponent = useMemo(() => {
        if (isPrimitiveField) {
            // Trivial dom-native form components are rgistered normally.
            return React.cloneElement(child, { ...register(name, registerOptions) });
        }

        // Others are registred by hooking into `onChange` and `value`.
        return (
            <Controller
                control={control}
                name={name}
                rules={registerOptions}
                render={({ field: { onChange, onBlur, value } }) => {
                    return React.cloneElement(child, { onChange, onBlur, value });
                }}
            />
        );
    }, []);

    return (
        <div className="mb-7">
            {label && (
                <label
                    className={cn('block text-sm font-medium text-gray-700 mb-1', { 'sr-only': labelHidden })}
                    htmlFor={name}
                >
                    {label}
                    {isRequired ? ' *' : ''}
                </label>
            )}
            {FormComponent}
            {hint && (
                <div className="mt-1 ml-1 text-gray-500 text-xs" id={`hint-${name}`}>
                    {hint}
                </div>
            )}
            {fieldError && (
                <div className="flex items-center pointer-events-none pr-3 text-red-500 mt-1">
                    <FaExclamationCircle className="w-5 h-5 text-red-500 mr-2" /> {errorMessages[fieldError.type]}
                </div>
            )}
        </div>
    );
});
