// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import clsx from 'clsx';
import React from 'react';

export type IconProps = {
    icon: string;
    iconClasses?: string;
    className?: boolean;
    hidden?: boolean;

    // needed?
    brand?: boolean;
};

export const Icon: React.FC<IconProps> = ({
    icon,
    className,
    brand,
    hidden = true,
}) => (
    <i
        className={clsx(
            {
                fas: !brand,
                fab: brand,
                'sr-only': hidden,
            },
            `fa-${icon}`,
            className
        )}
    />
);
