import { Switch } from '@headlessui/react';
import React, { FC, useEffect, useState } from 'react';

type ToggleProps = {
    label: string;
    onChange: (active: boolean) => void;
    value: boolean;
};

export const Toggle: FC<ToggleProps> = ({ label, onChange, value }) => {
    return (
        <Switch
            checked={value}
            onChange={onChange}
            className={`${
                value ? 'bg-brand-user' : 'bg-gray-200'
            } relative inline-flex items-center h-6 rounded-full w-11`}
        >
            <span className="sr-only">{label}</span>
            <span
                className={`${
                    value ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full`}
            />
        </Switch>
    );
};
