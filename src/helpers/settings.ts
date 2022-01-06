// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { format } from './format';

const assign = (d: Map<string, any>, key: string, value: any) => {
    if (value instanceof Map) {
        const map: Map<string, any> = new Map([]);
        //we deep-clone the map
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        update(map, value, true, false);
        d.set(key, map);
    } else d.set(key, value);
};

export function update(
    d: Map<string, any>,
    ed: Map<string, any>,
    overwrite = true,
    clone = false
) {
    if (!(ed instanceof Map) || !(d instanceof Map)) {
        throw new Error('Parameters are not maps!');
    }
    if (clone) d = new Map(d);
    for (const key of ed.keys()) {
        const value = ed.get(key);
        const dvalue = d.get(key);
        if (!d.has(key)) {
            assign(d, key, value);
        } else if (value instanceof Map && dvalue instanceof Map) {
            d.set(key, update(dvalue, value, overwrite, clone));
        } else {
            if (!overwrite) continue;
            assign(d, key, value);
        }
    }
    return d;
}

function hget(d: { [Key: string]: any }, key: string[], defaultValue?: any) {
    let kl = key;
    if (!Array.isArray(kl)) kl = [kl];
    let cv: any = d;
    for (let i = 0; i < kl.length; i++) {
        if (cv === undefined) return defaultValue;
        if (kl[i] !== undefined && kl[i].endsWith('?')) {
            const kle = kl[i].slice(0, kl[i].length - 1);
            let cvn: any;
            if (cv instanceof Map) cvn = cv.get(kle);
            else cvn = cv[kle];
            if (cvn !== undefined)
                // we only assign it if the value exists
                cv = cvn;
        } else {
            if (cv instanceof Map) cv = cv.get(kl[i]);
            // @ts-ignore
            else cv = cv[kl[i]];
        }
    }
    if (cv === undefined) return defaultValue;
    // we convert empty strings to 'undefined'
    if (cv === '') return undefined;
    return cv;
}

export default class Settings {
    map: Map<string, any>;

    constructor(...rest: any[]) {
        this.map = new Map(...rest);
    }

    /**
     * Sets the value of a key.
     */
    set(key: string, value: any) {
        return this.map.set(key, value);
    }

    update(other: Settings) {
        this.map = update(this.map, other.map, true, true);
    }

    updateWithMap(otherMap: Map<string, any>) {
        this.map = update(this.map, otherMap);
    }

    get(keyOrKeys: string | string[], defaultValue?: any) {
        let kl = keyOrKeys;
        if (!Array.isArray(kl)) kl = [kl];
        let cv = this.map;
        for (let i = 0; i < kl.length; i++) {
            if (cv === undefined || !(cv instanceof Map)) return defaultValue;
            cv = cv.get(kl[i]);
        }
        if (cv === undefined) return defaultValue;
        return cv;
    }

    /**
     * Tests whether a top level key is defined.
     * @param key The key to look for.
     */
    has(key: string) {
        return this.map.has(key);
    }

    /**
     * Get an iterator over all top level keys.
     */
    keys() {
        return this.map.keys();
    }

    /**
     * Get the current language for the app. This will affect translations.
     */
    lang(): string {
        return this.get('lang', 'en');
    }

    /**
     * Get a translation for a key.
     * @param key Translation key separated by dots or as an array of strings
     */
    t(t: object, key: string | string[]): string;
    t(t: object, key: string | string[], ...params: string[]): string[];
    t(t: object, key: string | string[], ...params: any[]): any[];
    t(t: object, key: string | string[], ...params: any[]): string | any[] {
        const kl: string[] = Array.isArray(key) ? key : key.split('.');
        const lang = this.lang();
        const value = hget(t, [...kl, lang]);
        if (value === undefined) {
            let source = '';
            // @ts-ignore
            if (t._t !== undefined && t._t.path !== undefined)
                // @ts-ignore
                source = `/(${t._t.path})`;
            return [`[mt: ${kl.join('/')}/${lang}${source}]`];
        }
        if (typeof value !== 'string')
            return [`[not a string: ${kl.join('/')}/${lang}]`];
        if (params.length > 0) return format(value.toString(), ...params);
        return value;
    }
}
