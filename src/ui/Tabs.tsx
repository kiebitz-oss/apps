import clsx from 'clsx';
import React from 'react';

export type TabsProps = React.ComponentProps<'ul'>;

export const Tabs: React.FC<TabsProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <ul
            className={clsx('tabs', className)}
            aria-orientation="horizontal"
            role="tablist"
            {...props}
        >
            {children}
        </ul>
    );
};
