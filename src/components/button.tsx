// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';

import classnames from 'helpers/classnames';
import './button.scss';

interface ButtonIconProps {
    icon: string;
    brand?: boolean;
};

export const ButtonIcon = ({ icon, brand = false }: ButtonIconProps) => (
    <span className="bulma-icon bulma-is-small">
        <i className={(brand ? 'fab' : 'fas') + ` fa-${icon}`} />
    </span>
);

interface ButtonLogoProps {
    logo: string;
};

export const ButtonLogo = ({ logo }: ButtonLogoProps) => (
    <span className="bulma-icon bulma-is-small kip-logo">
        <img src={logo} />
    </span>
);

type ButtonType = "primary" | "success" | "warning" | "danger";

interface ButtonProps
    extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'type'> {
    children?: React.ReactNode;
    type?: ButtonType;
};

export const Button: React.FC<ButtonProps> = ({
    children,
    type = 'primary',
    className,
    ...props
}) => (
    <button
        className={classnames(
            'bulma-button',
            `bulma-is-${type}`,
            className,
        )}
        onClick={onClick}
        {...props}
    >
        {children}
    </button>
);

//{icon && !waiting && <ButtonIcon icon={icon} brand={brand} />}
//{logo && !waiting && <ButtonLogo logo={logo} />}
//{waiting && <ButtonIcon icon="circle-notch fa-spin" />}
//<span>{children}</span>
