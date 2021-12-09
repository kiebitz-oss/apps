import React from 'react';
import clsx from 'clsx';

export type BoxHeaderProps = React.ComponentProps<'header'>;

export const BoxHeader: React.FC<BoxHeaderProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <header className={clsx('header', className)} {...props}>
            {children}
        </header>
    );
};
