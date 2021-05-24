// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// The local backend
export default class LocalBackend {
    constructor(settings, store) {
        this.settings = settings;
        this.store = store;
    }

    store(key, data) {
        // the tracing data contains only "public" information shown to
        // location operators, so we store it locally
        return new Promise((resolve, reject) => {
            // the traces are just stored as JSON objects
            this.store.set(key, JSON.stringify(data));
            resolve();
        });
    }

    get(key) {}

    // simulates the background tasks that the normal local backend would do
    backgroundTasks() {}
}
