import React from 'react';
import { Dialog } from '@headlessui/react';
import clsx from 'clsx';

interface ModalContentProps {
    className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <Dialog.Description
            as="div"
            className={clsx('content', className)}
            {...props}
        >
            {children}
        </Dialog.Description>
    );
};
