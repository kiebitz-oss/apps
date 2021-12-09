import { Menu } from '@headlessui/react';
import React from 'react';

interface DropdownMenuProps {
    label: string;
    className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    children,
    className = 'button secondary md',
    label,
}) => {
    return (
        <Menu as="div" className="inline-block relative text-left">
            <div>
                <Menu.Button className={className}>{label}</Menu.Button>
            </div>

            <Menu.Items className="absolute left-0 z-10 mt-2 w-56 bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                <div className="py-1 px-1">{children}</div>
            </Menu.Items>
        </Menu>
    );
};
