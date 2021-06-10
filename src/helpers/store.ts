// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

type Watcher = (store: Store, key: string, value: any, notifyId: number) => void;

/*
This function deep-copies objects and ensures only valid object types are store
in our store (maps, array, objects, numbers, strings). It can handle self-referencing,
circular data structures as well.
*/
export function copy(value, memo?: Map<any, any>) {
    memo = memo || new Map();
    if (memo.has(value)) return memo.get(value);
    let newValue = value;
    if (value instanceof Array) {
        newValue = [];
        memo.set(value, newValue);
        for (const v of value) {
            newValue.push(copy(v, memo));
        }
    } else if (value instanceof Map) {
        newValue = new Map();
        memo.set(value, newValue);
        for (const [k, v] of value.entries()) {
            newValue.set(copy(k, memo), copy(v, memo));
        }
    } else if (value instanceof Set) {
        newValue = new Set();
        memo.set(value, newValue);
        for (const [_, v] of value.entries()) newValue.add(copy(v, memo));
    } else if (value instanceof Object) {
        newValue = {};
        memo.set(value, newValue);
        for (const [k, v] of Object.entries(value)) {
            newValue[k] = copy(v, memo);
        }
    } else if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean' &&
        !isNaN(value) &&
        value !== undefined &&
        value !== null &&
        !(value instanceof String)
    )
        throw new Error('unserializable object type: ' + typeof value);
    return newValue;
}

export default class Store {
    private watchers: Map<string, Map<number, Watcher>>;
    private watcherId: number;
    private state: Record<string, any>;
    private notifyId: number;

    constructor() {
        this.watchers = new Map([]);
        this.watcherId = 0;
        this.notifyId = 0;
        this.state = {};
    }

    public set(key: string, value: any, overwrite?: boolean) {
        const copiedValue = copy(value);
        if (key === '') {
            Object.keys(copiedValue).forEach(key => {
                this.state[key] = copiedValue[key];
            });
        } else if (overwrite === true) {
            this.state[key] = copiedValue;
        } else {
            if (this.state[key] === undefined) this.state[key] = {};
            Object.keys(copiedValue).forEach(valueKey => {
                this.state[key][valueKey] = copiedValue[valueKey];
            });
        }
        this.notify(key, copy(this.state[key]));
        this.notify('', copy(this.state));
    }

    public get(key?: string) {
        if (!key)
            //we return the whole store
            return copy(this.state);
        return copy(this.state[key]);
    }

    public watch(key: string, watcher: Watcher) {
        if (!this.watchers.has(key)) this.watchers.set(key, new Map([]));
        const foundWatcher = this.watchers.get(key);
        if (!foundWatcher) throw new Error(`Just here so typescript is happy`);
        foundWatcher.set(this.watcherId, watcher);
        return this.watcherId++;
    }

    public unwatch(key: string, watcherId: number) {
        const foundWatcher = this.watchers.get(key);
        if (!foundWatcher) throw new Error('unknown key');
        if (foundWatcher.has(watcherId)) {
            foundWatcher.delete(watcherId);
        }
    }

    private notify(key: string, value: any) {
        const notifyId = this.notifyId++;
        const watchers = this.watchers.get(key);
        if (watchers === undefined) return;
        watchers.forEach(watcher => {
            watcher(this, key, value, notifyId);
        });
    }
}

export class LocalStorageStore extends Store {
    constructor() {
        super();
    }
}
