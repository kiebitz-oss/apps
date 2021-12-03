// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';

export function withTimer(Component, interval) {
    class Timer extends React.Component {
        constructor(props) {
            super(props);
            this.state = { timer: 0 };
            setTimeout(() => this.tick(), interval);
        }

        tick() {
            if (!this.mounted) return;
            const { timer } = this.state;
            this.setState({ timer: timer + 1 });
            setTimeout(() => this.tick(), interval);
        }

        componentWillUnmount() {
            this.mounted = false;
        }

        componentDidMount() {
            this.mounted = true;
        }

        render() {
            const { timer } = this.state;
            return <Component {...this.props} timer={timer} />;
        }
    }

    return Timer;
}
