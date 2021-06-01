// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import BaseActions from 'actions/base';
import t from './translations.yml';

export default class Settings extends BaseActions {
    static get defaultKey() {
        return 'settings';
    }

    constructor(store, settings, key) {
        super(store, settings, key);
        this.set({
            status: 'initialized',
        });
    }

    updateSettings(settings) {
        const loaded = settings.get('external');
        if (loaded) return;
        this.loadSettings(settings);
    }

    loadSettings(settings) {
        const loadSettings = ({ data, response }) => {
            const { response: oldResponse } = this.get();
            if (oldResponse !== undefined && response === oldResponse) {
                return;
            }
            const dataMap = new Map(Object.entries(data));
            // we update the settings with the external ones
            settings.updateWithMap(dataMap);
            settings.set('external', true);
            this.set({
                settings: dataMap,
                status: 'loaded',
                response: response,
            });
        };

        const xhr = new XMLHttpRequest();
        xhr.open('GET', settings.get('externalSettingsPath', '/settings.json'));

        const promise = new Promise((resolve, reject) => {
            xhr.onload = () => {
                const contentType = xhr
                    .getResponseHeader('content-type')
                    .trim();
                if (/^application\/json(;.*)?$/i.exec(contentType) === null)
                    reject({
                        status: xhr.status,
                        message: 'not a JSON response',
                        errors: {},
                    });

                const data = JSON.parse(xhr.response);

                if (xhr.status >= 200 && xhr.status < 300)
                    resolve({ data, response: xhr.response });
                else {
                    reject(data);
                }
            };
            xhr.onerror = () => {
                reject({
                    status: xhr.status,
                    message: xhr.statusText || settings.t(t, 'requestFailed'),
                    errors: {},
                });
            };
        });
        promise
            .then(({ data, response }) => loadSettings({ data, response }))
            .catch(error => this.set({ status: 'failed', error: error }));
        xhr.send();
    }
}
