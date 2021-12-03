// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';

import classnames from 'helpers/classnames';
import './button.scss';

interface ButtonIconProps {
    icon: string;
    brand?: boolean;
}

export const ButtonIcon = ({ icon, brand = false }: ButtonIconProps) => (
    <span className="bulma-icon bulma-is-small">
        <i className={(brand ? 'fab' : 'fas') + ` fa-${icon}`} />
    </span>
);

interface ButtonLogoProps {
    logo: string;
}

export const ButtonLogo = ({ logo }: ButtonLogoProps) => (
    <span className="bulma-icon bulma-is-small kip-logo">
        <img src={logo} />
    </span>
);

export interface ButtonProps extends React.ComponentProps<'button'> {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';

    // BC
    href?: string;
    waiting?: boolean;
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className,
    waiting,
    ...props
}) => {
    return (
        <button
            className={classnames(
                'bulma-button',
                `bulma-is-${variant}`,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

//{icon && !waiting && <ButtonIcon icon={icon} brand={brand} />}
//{logo && !waiting && <ButtonLogo logo={logo} />}
//{waiting && <ButtonIcon icon="circle-notch fa-spin" />}
//<span>{children}</span>
