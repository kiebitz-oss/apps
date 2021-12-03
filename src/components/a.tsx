// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import classNames from 'helpers/classnames';
import React from 'react';
import { Link } from 'react-router-dom';

interface AProps {
    href: string;
    onClick?: React.MouseEventHandler;
    external?: boolean;
    type?: 'button';
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export const A: React.FC<AProps> = ({
    children,
    external,
    className,
    onClick,
    href,
    variant,
    type,
    ...props
}) => {
    const classNameString = classNames(
        {
            'bulma-button': type === 'button',
            [`bulma-is-${variant}`]: variant,
        },
        className
    );

    if (onClick && !href) {
        return (
            <a
                href={href}
                onClick={onClick}
                className={classNameString}
                {...props}
            >
                {children}
            </a>
        );
    }

    if (external && href) {
        return (
            <a
                href={href}
                className={classNameString}
                rel="noopener noreferrer"
                target="_blank"
                {...props}
            >
                {children}
            </a>
        );
    }

    if (href && !external) {
        return (
            <Link
                to={href}
                className={classNameString}
                onClick={onClick}
                {...props}
            >
                {children}
            </Link>
        );
    }

    return (
        <Link
            to={href}
            className={classNameString}
            onClick={onClick}
            {...props}
        >
            {children}
        </Link>
    );
};
