import { Menu } from '@headlessui/react';
import React, { MouseEventHandler } from 'react';

interface DropdownMenuItemProps {
    icon?: string;
    onClick?: MouseEventHandler;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
    children,
    onClick,
    icon,
}) => {
    return (
        <Menu.Item>
            {({ active }) => (
                <button
                    onClick={onClick}
                    className={`${
                        active ? 'bg-primary-500 text-white' : 'text-gray-900'
                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                    {icon && <span className="sr-only">{icon}</span>}
                    {children}
                </button>
            )}
        </Menu.Item>
    );
};
