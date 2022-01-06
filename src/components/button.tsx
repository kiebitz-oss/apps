// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import classnames from 'helpers/classnames';
import './button.scss';

// @ts-ignore
import { A } from './a';

export const ButtonIcon = ({
    icon,
    brand,
}: {
    icon: string;
    brand?: boolean;
}) => (
    <span className="bulma-icon bulma-is-small">
        <i className={(brand ? 'fab' : 'fas') + ` fa-${icon}`} />
    </span>
);

export const ButtonLogo = ({ logo }: { logo: string }) => (
    <span className="bulma-icon bulma-is-small kip-logo">
        <img src={logo} />
    </span>
);

export const Button = ({
    children,
    flex,
    href,
    hashParams,
    params,
    icon,
    logo,
    light,
    brand,
    large,
    type,
    external,
    noText,
    htmlType,
    onClick,
    target,
    waiting,
    className,
    disabled,
    ...props
}: ButtonProps) => (
    <A
        external={external}
        target={target}
        onClick={(e: React.MouseEvent<HTMLLinkElement, MouseEvent>) =>
            !disabled && onClick !== undefined ? onClick(e) : false
        }
        href={href}
        params={params}
        hashParams={hashParams}
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

type ButtonProps = {
    className?: string;
    children?: React.ReactChild;
    disabled?: boolean;
    brand?: boolean;
    flex?: boolean;
    href?: string;
    icon?: string;
    large?: boolean;
    light?: boolean;
    params?: any;
    hashParams?: any;
    type?: string;
    target?: string;
    noText?: boolean;
    external?: boolean;
    logo?: string;
    htmlType?: 'submit' | 'reset' | 'button' | undefined;
    waiting?: boolean;
    primary?: boolean;
    onClick?: (e: React.MouseEvent<HTMLLinkElement>) => void;
};

Button.defaultProps = {
    children: undefined,
    brand: false,
    flex: false,
    waiting: false,
    href: undefined,
    light: false,
    htmlType: 'button',
    icon: undefined,
    large: false,
    type: 'primary',
    onClick: undefined,
};
