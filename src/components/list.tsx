// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ReactElement, FC } from 'react';
import classnames from 'helpers/classnames';
import './list.scss';

interface ListProps {
    children: ReactElement;
}

export const List: FC<ListProps> = ({ children }: ListProps) => (
    <div className="kip-list">{children}</div>
);

export const ListHeader: FC = ({ children }) => (
    <div className="kip-item kip-is-header">{children}</div>
);

type ListSize = "sm" | "md" | "lg";

interface ListColumnProps {
    children: ReactElement;
    size?: ListSize;
    wraps?: boolean;
}

export const ListColumn: FC<ListColumnProps> = ({
    children,
    size = 'md',
    wraps = false,
}) => (
    <div
        className={classnames(`kip-col kip-is-${size}`, { 'kip-wraps': wraps })}
    >
        {children}
    </div>
);

interface ListItemProps {
    children: ReactElement;
    size?: ListSize;
    wraps?: boolean;
    isCard?: boolean;
    onClick?: () => any;
}

export const ListItem: FC<ListItemProps> = ({ children, isCard = true, onClick }: ListItemProps) => (
    <div
        // Make focusable with the keyboard, if a handler is available
        tabIndex={onClick ? 0 : -1}
        className={classnames('kip-item', {
            'kip-is-card': isCard,
            'kip-is-clickable': onClick,
        })}
        onClick={(e) => {
            e.preventDefault();
            if (onClick) onClick();
        }}
    >
        {children}
    </div>
);
