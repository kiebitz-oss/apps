// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign } from 'helpers/crypto';

function urlEncode(data) {
    if (data && typeof data === 'object') {
        return Object.keys(data)
            .map(
                key =>
                    encodeURIComponent(key) +
                    '=' +
                    encodeURIComponent(data[key])
            )
            .join('&');
    }
    return null;
}

class JSONRPCBackend {
    constructor(settings, urlKey) {
        this.settings = settings;
        this.urlKey = urlKey;
    }

    get apiUrl() {
        return this.settings.get(this.urlKey);
    }

    request(opts) {
        const normalize = data => {
            if (data.errors === undefined) data.errors = {};
            return data;
        };

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const params = urlEncode(opts.params);
            xhr.open(
                opts.method,
                opts.url + (params !== null ? '?' + params : '')
            );

            xhr.onload = () => {
                const contentType = (
                    xhr.getResponseHeader('content-type') || ''
                ).trim();
                if (/^application\/json(;.*)?$/i.exec(contentType) === null)
                    reject({
                        status: xhr.status,
                        message: 'not a JSON response',
                        errors: {},
                    });
                const data = normalize(JSON.parse(xhr.response));
                data.status = xhr.status;
                // this is a non-cryptogaphic hash, just used to e.g. decide whether we should
                // rerender a given graph...
                data.hash = hash(xhr.response);
                if (xhr.status >= 200 && xhr.status < 300) {
                    // setTimeout( () => resolve(data), 1000); // uncomment to add a delay for debugging
                    resolve(data);
                } else {
                    reject(data);
                }
            };
            xhr.onerror = () => {
                reject({
                    status: xhr.status,
                    message:
                        xhr.statusText || this.settings.t(t, 'requestFailed'),
                    errors: {},
                });
            };
            if (opts.headers) {
                Object.entries(opts.headers).forEach(([key, value]) => {
                    xhr.setRequestHeader(key, value);
                });
            }
            const data = opts.data;
            const json = opts.json;

            if (data !== undefined) {
                xhr.setRequestHeader(
                    'Content-Type',
                    'application/x-www-form-urlencoded'
                );
                xhr.send(urlEncode(data));
            } else if (json !== undefined) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(json));
            } else {
                xhr.send();
            }
        });
    }

    async call(method, params, keyPair, id) {
        return await this.request({
            url: `${this.apiUrl}`,
            method: 'POST',
            json: {
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: id,
            },
        });
    }
}

export default JSONRPCBackend;
