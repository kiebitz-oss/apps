// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { MouseEventHandler, useState } from 'react';
import classnames from 'helpers/classnames';
import { A } from './a';

import './tabs.scss';

export const Tabs: React.FC = ({ children }) => {
    const [active, setActive] = useState(false);
    const toggle: MouseEventHandler<HTMLButtonElement> = () =>
        setActive(!active);

    return (
        <button
            className={classnames('bulma-tabs', {
                active: active,
            })}
            onClick={toggle}
        >
            <span className="bulma-more">
                <span className="cm-tabs-more">&or;</span>
            </span>

            <ul>{children}</ul>
        </button>
    );
};

interface TabProps {
    active: boolean;
    href: string;
    icon: React.ReactNode;
    last?: boolean;
    onClick: MouseEventHandler<HTMLAnchorElement>;
}

export const Tab: React.FC<TabProps> = ({
    active,
    children,
    href,
    icon,
    onClick,
    last = false,
}) => (
    <li
        className={classnames(
            { 'bulma-is-active': active },
            { 'kip-is-last': last }
        )}
    >
        <A href={href} onClick={onClick}>
            {icon && <span className="kip-icon is-small">{icon}</span>}
            {children}
        </A>
    </li>
);
