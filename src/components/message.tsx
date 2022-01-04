// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { ReactChild } from 'react';
import { ButtonIcon } from './button';
import classnames from 'helpers/classnames';
import './message.scss';

type MessageProps = {
    className?: string;
    waiting?: boolean;
    children: ReactChild;
    type: string;
};

export const Message = ({
    children,
    className,
    waiting,
    type,
}: MessageProps) => (
    <div className={classnames(className, 'bulma-message', `bulma-is-${type}`)}>
        <div className="bulma-message-body">
            {waiting && (
                <React.Fragment>
                    <ButtonIcon icon="circle-notch fa-spin" />
                    &nbsp;
                </React.Fragment>
            )}
            {children}
        </div>
    </div>
);
