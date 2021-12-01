// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import classNames from 'helpers/classnames';
import React, { forwardRef } from 'react';
import './switch.scss';

interface SwitchProps extends React.HTMLAttributes<HTMLInputElement> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div>
                <label
                    // tabIndex="0"
                    className={
                        classNames('kip-switch', className)

                        // + (updating ? ' kip-switch-updating' : '')
                    }
                    // style={{ width: textWidth + 54 + 'px' }}
                >
                    <input
                        type="checkbox"
                        {...props}
                        ref={ref}
                        // tabIndex="0"
                        // role="button"
                        // checked={checked}
                        // onChange={(e) => {
                        //     if (onChange !== undefined) onChange(!checked);
                        // }}
                    />
                    <span className="kip-slider kip-round">
                        <span className="kip-knob" />
                        <span className="kip-text" /* ref={this.textRef} */>
                            {children}
                        </span>
                    </span>
                </label>
            </div>
        );
    }
);

Switch.displayName = 'Switch';
