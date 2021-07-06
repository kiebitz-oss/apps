// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { barChart } from './bar-helpers';
import './bar.scss';

export class BarChart extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    updateSize = () => {
        this.renderChart();
    };

    shouldComponentUpdate(nextProps) {
        if (this.props.hash === undefined) return true;
        return nextProps.hash !== this.props.hash;
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateSize);
        this.renderChart();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSize);
    }

    componentDidUpdate() {
        this.renderChart();
    }

    renderChart() {
        const { data } = this.props;
        const element = this.ref.current;
        barChart(element, data.bars, data.opts);
    }

    render() {
        return <div className="kip-bar-chart" ref={this.ref} />;
    }
}
