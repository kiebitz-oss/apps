// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import './switch.scss';

export class Switch extends React.Component {
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
        this.state = {
            textWidth: 60,
        };
    }

    componentDidMount() {
        this.setState({
            textWidth: this.textRef.current.offsetWidth,
        });
    }

    componentDidUpdate() {
        const ow = this.textRef.current.offsetWidth;
        const { textWidth } = this.state;
        if (ow === textWidth) return;
        requestAnimationFrame(() => {
            if (this.textRef.current !== null)
                this.setState({
                    textWidth: this.textRef.current.offsetWidth,
                });
        });
    }

    render() {
        const { checked, updating, disabled, children, onChange } = this.props;
        const { textWidth } = this.state;
        return (
            <fieldset disabled={disabled}>
                <label
                    className={
                        'kip-switch' + (updating ? ' kip-switch-updating' : '')
                    }
                    style={{ width: textWidth + 54 + 'px' }}
                >
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                            if (onChange !== undefined) onChange(!checked);
                        }}
                    />
                    <span className="kip-slider kip-round">
                        <span className="kip-knob" />
                        <span className="kip-text" ref={this.textRef}>
                            {children}
                        </span>
                    </span>
                </label>
            </fieldset>
        );
    }
}
