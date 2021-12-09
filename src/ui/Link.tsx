// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import clsx from 'clsx';
import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { Size } from 'types/Size';
import { Variant } from 'types/Variant';

export interface LinkProps extends Omit<RouterLinkProps, 'to'> {
    external?: boolean;
    variant?: Variant;
    size?: Size;
    type?: 'link' | 'button';
    href: string;
}

export const Link: React.FC<LinkProps> = ({
    children,
    href,
    variant,
    size = 'md',
    className,
    type,
    external,
    rel,
    target,
    ...props
}) => {
    if (!href || external) {
        return (
            // eslint-disable-next-line react/jsx-no-target-blank
            <a
                className={clsx(
                    {
                        ['button']: type === 'button',
                        ['link']: !type,
                    },
                    variant,
                    size,
                    className
                )}
                rel={external && !rel ? 'noreferrer' : rel}
                target={external && !target ? '_blank' : target}
                href={href}
            >
                {children}
            </a>
        );
    }

    return (
        <RouterLink
            className={clsx(
                {
                    ['button']: type === 'button',
                    ['link']: !type,
                },
                variant,
                size,
                className
            )}
            rel={rel}
            target={target}
            to={href}
            {...props}
        >
            {children}
        </RouterLink>
    );
};
