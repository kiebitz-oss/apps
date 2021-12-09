import clsx from 'clsx';
import React from 'react';

type ModalFooterProps = React.ComponentProps<'div'>;

export const ModalFooter: React.FC<ModalFooterProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <footer className={clsx('footer', className)} {...props}>
            {children}
        </footer>
    );
};
