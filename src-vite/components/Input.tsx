import React, { FC } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import cn from 'classnames';

export type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    inputClassName?: string;
    leadingIcon?: React.ReactElement;
    trailingIcon?: React.ReactElement;
};

export const Input: FC<InputProps> = (props) => {
    const { leadingIcon, trailingIcon, className, inputClassName, ...inputProps } = props;
    const inlineIconClasses = 'absolute inset-y-0 flex items-center pointer-events-none';

    return (
        <div className={className}>
            {leadingIcon && (
                <div className={cn(inlineIconClasses, 'left-0 pl-3')}>
                    {React.cloneElement(leadingIcon, { className: 'h-5 w-5 text-gray-400' })}
                </div>
            )}
            <input
                {...inputProps}
                className={cn(
                    'block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2',
                    inputClassName
                )}
            />
            {trailingIcon && (
                <div className={cn(inlineIconClasses, 'right-0 pr-3')}>
                    {React.cloneElement(trailingIcon, { className: 'h-5 w-5 text-gray-400' })}
                </div>
            )}
        </div>
    );
};
