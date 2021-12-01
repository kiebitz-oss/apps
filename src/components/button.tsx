// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';

import classnames from 'helpers/classnames';
import './button.scss';

import { A } from './a';

export const ButtonIcon = ({ icon, brand }: any) => (
    <span className="bulma-icon bulma-is-small">
        <i className={(brand ? 'fab' : 'fas') + ` fa-${icon}`} />
    </span>
);

export const ButtonLogo = ({ logo }: any) => (
    <span className="bulma-icon bulma-is-small kip-logo">
        <img src={logo} />
    </span>
);

interface ButtonProps
    extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'type'> {
    brand?: boolean;
    children?: React.ReactNode;
    flex?: boolean;
    href?: string;
    icon?: React.ReactNode;
    large?: boolean;
    light?: boolean;
    type?: string;
    htmlType?: string;
    waiting?: boolean;
    primary?: boolean;
    params?: any;
    logo?: string;
    external?: boolean;
    noText?: boolean;
    target?: string;
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    flex,
    href,
    params,
    icon,
    logo,
    light,
    brand,
    large,
    type = 'primary',
    external = false,
    noText,
    htmlType = 'button',
    target,
    waiting,
    className,
    disabled,
    onClick,
    ...props
}) => (
    <A
        external={external}
        target={target}
        onClick={(e) =>
            !disabled && onClick !== undefined ? onClick(e) : false
        }
        href={href}
        params={params}
    >
        <button
            disabled={disabled}
            className={classnames(
                'bulma-button',
                `bulma-is-${type}`,
                className,
                {
                    'kip-no-text': noText,
                    'bulma-is-flex': flex,
                    'bulma-is-large': large,
                    'bulma-is-light': light,
                }
            )}
            {...props}
            type={htmlType}
        >
            {icon && !waiting && <ButtonIcon icon={icon} brand={brand} />}
            {logo && !waiting && <ButtonLogo logo={logo} />}
            {waiting && <ButtonIcon icon="circle-notch fa-spin" />}
            <span>{children}</span>
        </button>
    </A>
);
