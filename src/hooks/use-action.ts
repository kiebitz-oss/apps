// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export enum Status {
    Failed,
    Succeeded,
    Loading,
    Updating,
}

export interface StoreValue {
    status: Status;
    data: any;
}

export interface Store {
    get(): any;
    set(): any;
}

export interface Action {
    (): StoreValue;
}

export function useAction(action: Action) {
    return action;
}
