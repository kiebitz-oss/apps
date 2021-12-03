// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { ButtonIcon } from './button';
import classnames from 'helpers/classnames';
import './message.scss';

interface MessageProps extends React.ComponentProps<'div'> {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    waiting?: boolean;
}

export const Message: React.FC<MessageProps> = ({
    children,
    className,
    waiting,
    variant,
    ...props
}) => (
    <div
        className={classnames(
            className,
            'bulma-message',
            `bulma-is-${variant}`
        )}
        {...props}
    >
        <div className="bulma-message-body">
            {waiting && <ButtonIcon icon="circle-notch fa-spin" />}
            {children}
        </div>
    </div>
);
