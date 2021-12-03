// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';

import './card.scss';
import classNames from 'helpers/classnames';

interface CardProps extends React.ComponentProps<'div'> {
    centered?: boolean;
    flex?: boolean;
    tight?: boolean;
    size?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    centered,
    size,
    flex,
    tight,
    className,
    ...props
}) => (
    <div
        className={classNames(
            'kip-card',
            {
                'kip-is-tight': tight,
                'kip-is-centered': centered,
                [`kip-is-${size}`]: size,
                'kip-is-flex': flex,
            },
            className
        )}
        {...props}
    >
        {children}
    </div>
);

interface CardContentProps extends React.ComponentProps<'div'> {
    noPadding?: boolean;
    centered?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({
    className,
    children,
    noPadding,
    centered,
    ...props
}) => (
    <div
        className={classNames('kip-card-content', className, {
            'kip-card-no-padding': noPadding,
            'kip-card-centered': centered,
            'kip-centered-card': centered,
            'kip-is-info': centered,
            'kip-is-fullheight': centered,
        })}
        {...props}
    >
        {children}
    </div>
);

interface CardNavProps extends React.ComponentProps<'div'> {
    active?: boolean;
    disabled?: boolean;
}

export const CardNav: React.FC<CardNavProps> = ({
    children,
    disabled,
    active,
    ...props
}) => (
    <div
        {...props}
        className={classNames('kip-card-nav', {
            'kip-card-nav-active': active,
            'kip-card-nav-disabled': disabled,
        })}
    >
        {children}
    </div>
);

export const CardHeader: React.FC<React.ComponentProps<'div'>> = ({
    children,
    className,
    ...props
}) => (
    <div {...props} className={classNames('kip-card-header', className)}>
        <div className="kip-card-title">{children}</div>
    </div>
);

export const CardFooter: React.FC<React.ComponentProps<'div'>> = ({
    children,
    className,
    ...props
}) => (
    <div className={classNames('kip-card-footer', className)} {...props}>
        {children}
    </div>
);

interface CenteredCardProps extends CardProps {
    embedded?: boolean;
}

export const CenteredCard: React.FC<CenteredCardProps> = ({
    children,
    className,
    embedded = false,
    ...props
}) => (
    <section
        className={classNames(
            'kip-centered-card',
            'kip-is-info',
            'kip-is-fullheight',
            { 'kip-is-embedded': embedded },
            className
        )}
    >
        <Card
            centered
            {...props}
            className={classNames({ 'kip-is-embedded': embedded })}
        >
            {children}
        </Card>
    </section>
);
