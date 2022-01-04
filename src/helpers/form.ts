// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Settings from "./settings";

export function isEmpty(value: string): boolean {
    return value === undefined || value === null || value === "";
}

export default class Form {
    data: Record<string, any>;
    settings: Settings;
    _errors: Record<string, any>;
    _errorMessage?: string;
    _valid?: boolean;

    constructor(
        data: Record<string, any>,
        settings: Settings,
        error: Record<string, any>
    ) {
        this.data = data || {};
        this.settings = settings;
        const r = this.validate()
        if (r instanceof Array)
            [this._errors, this._errorMessage] = r;
        else
            this._errors = r;
        this._valid = Object.keys(this._errors).length === 0;
        if (error !== undefined) {
            this._errorMessage = error.message;
            for (const [k, v] of Object.entries(error.errors || {})) {
                this._errors[k] = v;
            }
        }
    }

    get errors() {
        return this._errors;
    }

    get valid() {
        return this._valid;
    }

    get errorMessage() {
        return this._errorMessage;
    }

    get error() {
        return {
            message: this.errorMessage,
            errors: this.errors
        };
    }

    validate(): Record<string, string> {
        return {};
    }
}
