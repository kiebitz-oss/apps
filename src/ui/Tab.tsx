import clsx from 'clsx';
import React from 'react';
import { Link } from 'ui';

export interface TabProps extends React.ComponentProps<'li'> {
    current?: boolean;
    href?: string;
    icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({
    children,
    href,
    current,
    className,
    ...props
}) => {
    if (href) {
        return (
            <li
                aria-selected={current}
                role="tab"
                className={clsx('tab', { ['current']: current }, className)}
                {...props}
            >
                <Link href={href}>{children}</Link>
            </li>
        );
    }

    return (
        <li
            aria-selected={current}
            role="tab"
            className={clsx('tab', { ['current']: current }, className)}
            {...props}
        >
            {children}
        </li>
    );
};
