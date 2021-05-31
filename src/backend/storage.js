// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// The storage backend
export default class StorageBackend {
    constructor(settings) {
        this.settings = settings;
    }

    storeSettings(id, data) {}

    getSettings(id) {}
}
