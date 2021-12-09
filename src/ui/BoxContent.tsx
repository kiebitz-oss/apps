import React from 'react';
import clsx from 'clsx';

export type BoxContentProps = React.ComponentProps<'div'>;

export const BoxContent: React.FC<BoxContentProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div className={clsx('content', className)} {...props}>
            {children}
        </div>
    );
};
