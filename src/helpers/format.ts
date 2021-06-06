// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export function format(str: string, ...rest: string[]): string[];
export function format(str: string, ...rest: any[]): any[];
export function format(str: string, ...rest: any[]): any[] {
    const t = typeof rest[0];
    let args;
    if (rest.length === 0) args = {};
    else
        args =
            t === "string" || t === "number"
                ? Array.prototype.slice.call(rest)
                : rest[0];

    const splits = [];

    let s = str.toString();
    while (s.length > 0) {
        const m = s.match(/\{(?!\{)([\w\d]+)\}(?!\})/);
        if (m !== null && m.index !== undefined) {
            const left = s.substr(0, m.index);
            s = s.substr(m.index + m[0].length);
            const n = parseInt(m[1]);
            splits.push(left);
            // eslint-disable-next-line eqeqeq
            if (n != n) {
                // not a number
                splits.push(args[m[1]]);
            } else {
                // a numbered argument
                splits.push(args[n]);
            }
        } else {
            splits.push(s);
            s = "";
        }
    }
    return splits;
}

export function formatDuration(minutes, settings, t){
    if (minutes < 60)
        return settings.t(t, 'minute-string', {minutes: minutes})
    const hours = Math.floor(minutes/60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0)
        return settings.t(t, 'hour-string', {hours: hours})
    return settings.t(t, 'hour-minute-string', {hours: hours, minutes: remainingMinutes})
}