// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import classNames from 'helpers/classnames';
import React, { forwardRef } from 'react';
import './switch.scss';

type SwitchProps = React.ComponentPropsWithoutRef<'input'>;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <label className={classNames('kip-switch', className)}>
                <input type="checkbox" {...props} ref={ref} />

                <span className="kip-slider kip-round">
                    <span className="kip-knob" />
                    <span className="kip-text">{children}</span>
                </span>
            </label>
        );
    }
);

Switch.displayName = 'Switch';
