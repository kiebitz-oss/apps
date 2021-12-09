// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect } from 'react';
import { BarChart, withActions, WithLoader } from 'components';
import { Message, Box, BoxHeader, BoxContent, Title } from 'ui';
import { getStats } from 'apps/mediator/actions';
import { SummaryBox } from './SummaryBox';
import { Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';

export const todayPlusN = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return d;
};

const minDate = (data: any) => {
    return Math.min(...data.map((entry: any) => new Date(entry.from)));
};

const maxDate = (data: any, to?: any) => {
    return Math.max(
        ...data.map((entry: any) => new Date(to ? entry.to : entry.from))
    );
};

const toSeries = (data: any, mnd: any, mxd: any, dt: any) => {
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

const generateDates = (mnd: any, mxd: any, dt: any, offset?: any) => {
    const d = [];
    let cd = mnd;

    while (cd <= mxd) {
        d.push(new Date(cd + (offset ? dt : 0)));
        cd += dt;
    }

    return d;
};

const prepareOverallStats = (dailyStats: any) => {
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

const prepareHourlyStats = (hourlyStats: any) => {
    const { data } = hourlyStats;
    const mnd = minDate(data);
    const mxd = maxDate(data);
    const dt = 60 * 60 * 1000; // one hour steps
    const series = new Map();
    const titles: any[] = [];
    const ref: any[] = [];
    const refTitles: any[] = [];
    const dates = generateDates(mnd, mxd, dt);
    const datesTo = generateDates(mnd, mxd, dt, true);

    for (const key of ['open', 'booked']) {
        series.set(
            key,
            toSeries(
                data
                    .filter(
                        (entry: any) =>
                            entry.name === key && entry.data === null
                    )
                    .sort(
                        (a: any, b: any) => new Date(a.from) - new Date(b.from)
                    ),
                mnd,
                mxd,
                dt
            )
        );
    }

    series
        .get('open')
        .forEach((v: any, i: any) => ref.push(series.get('booked')[i] + v));

    series.forEach((v, k) =>
        titles.push(
            v.map((vv: any, i: any) =>
                i18n._(vv === 1 ? `titles.${k}One` : `titles.${k}`, {
                    values: {
                        n: vv,
                        from: dates[i].toLocaleString('en-US', opts),
                        to:
                            datesTo[i].getDate() === dates[i].getDate()
                                ? datesTo[i].toLocaleTimeString(
                                      'en-US',
                                      timeOpts
                                  )
                                : datesTo[i].toLocaleString('en-US', opts),
                    },
                })
            )
        )
    );

    dates.forEach((date, i) =>
        refTitles.push(
            i18n._('refTitle', {
                values: {
                    from: dates[i].toLocaleString('en-US', opts),
                    to:
                        datesTo[i].getDate() === dates[i].getDate()
                            ? datesTo[i].toLocaleTimeString('en-US', timeOpts)
                            : datesTo[i].toLocaleString('en-US', opts),
                },
            })
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

const fetchStatistics = ({ getStatsAction }: any) => {
    const params = {
        filter: { zipCode: null },
        id: 'queues',
        type: 'hour',
        from: todayPlusN(-1).toISOString(),
        to: todayPlusN(1).toISOString(),
    };

    getStatsAction(params);
};

const renderLoaded = ({ getStats }: any) => {
    const summary = prepareOverallStats(getStats);

    if (summary.show === 0) {
        return (
            <Box>
                <Message variant="warning">
                    <Trans id="noData" />
                </Message>
            </Box>
        );
    }

    return (
        <>
            <Box>
                <BoxContent>
                    <Trans id="dateSpan">
                        Zeige Daten von{' '}
                        <strong>
                            {new Date(summary.from).toLocaleString(
                                'en-US',
                                opts
                            )}
                        </strong>{' '}
                        bis{' '}
                        <strong>
                            {new Date(summary.to).toLocaleString('en-US', opts)}
                        </strong>
                        .
                    </Trans>
                </BoxContent>
            </Box>

            <div className="flex gap-4">
                <div className="md:w-1/4">
                    <SummaryBox
                        open={summary.open}
                        booked={summary.booked}
                        active={summary.active}
                    />
                </div>

                <div className="md:w-3/4">
                    <Box>
                        <BoxHeader>
                            <Title>
                                <Trans id="bookingRate" />
                            </Title>
                        </BoxHeader>
                        <BoxContent>
                            <BarChart data={prepareHourlyStats(getStats)} />
                        </BoxContent>
                    </Box>
                </div>
            </div>
        </>
    );
};

const StatsTabBase: React.FC<any> = ({ getStats, getStatsAction }) => {
    useEffect(() => {
        if (getStatsAction) {
            fetchStatistics({ getStatsAction });
        }
    }, [getStatsAction]);

    return (
        <WithLoader
            resources={[getStats]}
            renderLoaded={() => renderLoaded({ getStats })}
        />
    );
};

export const StatsTab = withActions(StatsTabBase, [getStats]);
