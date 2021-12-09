import React from 'react';
import clsx from 'clsx';

export type BoxFooterProps = React.ComponentProps<'footer'>;

export const BoxFooter: React.FC<BoxFooterProps> = ({
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
