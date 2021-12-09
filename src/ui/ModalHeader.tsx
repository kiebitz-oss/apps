import React from 'react';
import { Dialog } from '@headlessui/react';
import clsx from 'clsx';

interface ModalHeaderProps {
    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <Dialog.Title
            as="header"
            className={clsx('header', className)}
            {...props}
        >
            {children}
        </Dialog.Title>
    );
};
