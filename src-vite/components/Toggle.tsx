import { Switch } from '@headlessui/react';
import React, { FC } from 'react';

type ToggleProps = {
    onChange?: (active: boolean) => void;
    label?: string;
    value?: boolean;
};

export const Toggle: FC<ToggleProps> = ({ label, onChange = () => {}, value, ...switchProps }) => {
    return (
        <Switch.Group as="div" className="flex items-center">
            <Switch
                checked={value ?? false}
                onChange={onChange}
                className={`${
                    value ? 'bg-brand-user' : 'bg-gray-200'
                } relative inline-flex items-center h-6 rounded-full w-11`}
                {...switchProps}
            >
                <span
                    className={`${
                        value ? 'translate-x-6' : 'translate-x-1'
                    } inline-block w-4 h-4 transform bg-white rounded-full`}
                />
            </Switch>
            {label && (
                <Switch.Label as="span" className="ml-3">
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                </Switch.Label>
            )}
        </Switch.Group>
    );
};
