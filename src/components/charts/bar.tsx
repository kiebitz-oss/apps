// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef } from 'react';
import { barChart } from './bar-helpers';
import './bar.scss';

export const BarChart: React.FC<{ data: any }> = ({ data }) => {
    const ref = useRef<HTMLDivElement>(null);

    const renderChart = () => {
        barChart(ref.current, data.bars, data.opts);
    };

    useEffect(() => {
        window.addEventListener('resize', renderChart);

        return () => {
            window.removeEventListener('resize', renderChart);
        };
    });

    return <div className="kip-bar-chart" ref={ref} />;
};
