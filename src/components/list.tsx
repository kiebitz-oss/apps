// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'helpers/classnames';
import './list.scss';

export const List: React.FC = ({ children }) => (
    <div className="kip-list">{children}</div>
);

export const ListHeader: React.FC = ({ children }) => (
    <div className="kip-item kip-is-header">{children}</div>
);

export const ListColumn: React.FC = ({
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

export const ListItem: React.FC = ({ children, isCard = true, onClick }) => (
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

ListItem.propTypes = {
    children: PropTypes.node,
    isCard: PropTypes.bool,
    onClick: PropTypes.func,
};
