// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import {
    BarChart,
    withActions,
    withSettings,
    A,
    Message,
    WithLoader,
    Card,
    CardHeader,
    CardContent,
    T,
} from 'components';
import { getStats } from '../actions';
import SummaryBox from './summary-box';
import t from './translations.yml';
import './stats.scss';

export const todayPlusN = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
};

const minDate = (data) =>
    Math.min(...data.map((entry) => new Date(entry.from)));
const maxDate = (data, to) =>
    Math.max(...data.map((entry) => new Date(to ? entry.to : entry.from)));
const toSeries = (data, mnd, mxd, dt) => {
    const d = [];
    let cd = mnd;
    let i = 0;
    while (cd <= mxd) {
        const id = i < data.length ? new Date(data[i].from) : undefined;
        if (id === undefined || id > cd) {
            // there's a missing date
            d.push(0);
        } else {
            d.push(data[i].value);
            i++;
        }
        cd += dt;
    }
    return d;
};

const generateDates = (mnd, mxd, dt, offset) => {
    const d = [];
    let cd = mnd;
    while (cd <= mxd) {
        d.push(new Date(cd + (offset ? dt : 0)));
        cd += dt;
    }
    return d;
};

const prepareOverallStats = (dailyStats) => {
    const { data } = dailyStats;
    // we just show summary statistics for declines, accepts
    const summary = {
        from: minDate(data),
        to: maxDate(data, true),
        open: 0,
        booked: 0,
        active: 0,
    };
    for (const key of ['open', 'booked', 'active']) {
        data.filter(
            (entry) => entry.name === key && entry.data === null
        ).forEach(
            (entry) => (summary[key] = Math.max(entry.value, summary[key]))
        );
    }
    return summary;
};

const timeOpts = { hour: 'numeric' };
const dateOpts = { month: 'numeric', year: 'numeric', day: 'numeric' };
const opts = { ...timeOpts, ...dateOpts };

const prepareHourlyStats = (hourlyStats, settings) => {
    const { data } = hourlyStats;
    const mnd = minDate(data);
    const mxd = maxDate(data);
    const dt = 60 * 60 * 1000; // one hour steps
    const series = new Map();
    const titles = [];
    const ref = [];
    const refTitles = [];
    const dates = generateDates(mnd, mxd, dt);
    const datesTo = generateDates(mnd, mxd, dt, true);
    for (const key of ['open', 'booked']) {
        series.set(
            key,
            toSeries(
                data
                    .filter(
                        (entry) => entry.name === key && entry.data === null
                    )
                    .sort((a, b) => new Date(a.from) - new Date(b.from)),
                mnd,
                mxd,
                dt
            )
        );
    }
    series.get('open').forEach((v, i) => ref.push(series.get('booked')[i] + v));
    series.forEach((v, k) =>
        titles.push(
            v.map((vv, i) =>
                settings
                    .t(t, vv === 1 ? `titles.${k}One` : `titles.${k}`, {
                        n: vv,
                        from: dates[i].toLocaleString('en-US', opts),
                        to:
                            datesTo[i].getDate() === dates[i].getDate()
                                ? datesTo[i].toLocaleTimeString(
                                      'en-US',
                                      timeOpts
                                  )
                                : datesTo[i].toLocaleString('en-US', opts),
                    })
                    .join('')
            )
        )
    );
    dates.forEach((date, i) =>
        refTitles.push(
            settings
                .t(t, 'refTitle', {
                    from: dates[i].toLocaleString('en-US', opts),
                    to:
                        datesTo[i].getDate() === dates[i].getDate()
                            ? datesTo[i].toLocaleTimeString('en-US', timeOpts)
                            : datesTo[i].toLocaleString('en-US', opts),
                })
                .join('')
        )
    );
    return {
        bars: Array.from(series.values()),
        opts: {
            relative: true,
            ref: ref,
            refTitles: refTitles,
            classNames: ['kip-open', 'kip-booked'],
            xTicks: [
                dates.map((date) => date.toLocaleTimeString('en-US', timeOpts)),
                dates.map((date) => date.toLocaleDateString('en-US', dateOpts)),
            ],
            titles: titles,
        },
    };
};

class Stats extends React.Component {
    constructor(props) {
        super(props);
        this.fetchStatistics();
    }

    fetchStatistics() {
        const { getStatsAction } = this.props;
        const params = {
            filter: { zipCode: null },
            id: 'queues',
            type: 'hour',
            from: todayPlusN(-1).toISOString(),
            to: todayPlusN(1).toISOString(),
        };
        getStatsAction(params);
    }

    renderLoaded = () => {
        const { getStats, settings } = this.props;
        const summary = prepareOverallStats(getStats);
        let content;
        if (summary.show === 0) {
            content = (
                <div className="bulma-column bulma-is-fullwidth-desktop">
                    <Card size="fullwidth">
                        <Message type="warning">
                            <T t={t} k="noData" />
                        </Message>
                    </Card>
                </div>
            );
        } else {
            content = (
                <React.Fragment>
                    <div className="bulma-column bulma-is-full-desktop">
                        <Card size="fullwidth" flex>
                            <CardContent>
                                <T
                                    key="span"
                                    t={t}
                                    k="dateSpan"
                                    from={
                                        <strong key="s1">
                                            {new Date(
                                                summary.from
                                            ).toLocaleString('en-US', opts)}
                                        </strong>
                                    }
                                    to={
                                        <strong key="s2">
                                            {new Date(
                                                summary.to
                                            ).toLocaleString('en-US', opts)}
                                        </strong>
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="bulma-column bulma-is-one-quarter-desktop">
                        <SummaryBox
                            open={summary.open}
                            booked={summary.booked}
                            active={summary.active}
                        />
                    </div>
                    <div className="bulma-column bulma-is-three-quarters-desktop bulma-is-flex">
                        <Card size="fullwidth" flex>
                            <CardHeader>
                                <h2>
                                    <T t={t} k="bookingRate" />
                                </h2>
                            </CardHeader>
                            <CardContent className="kip-cm-overview">
                                <BarChart
                                    hash={getStats.hash}
                                    data={prepareHourlyStats(
                                        getStats,
                                        settings
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </React.Fragment>
            );
        }
        return (
            <CardContent>
                <div className="bulma-columns bulma-is-multiline bulma-is-desktop">
                    {content}
                </div>
            </CardContent>
        );
    };

    render() {
        const { getStats } = this.props;
        return (
            <WithLoader
                resources={[getStats]}
                renderLoaded={this.renderLoaded}
            />
        );
    }
}

export default withActions(withSettings(Stats), [getStats], []);
