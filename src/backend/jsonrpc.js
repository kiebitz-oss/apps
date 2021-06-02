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

function hash(str) {
    let hash = 0,
        i,
        chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

class JSONRPCBackend {
    constructor(settings, urlKey) {
        this.settings = settings;
        this.urlKey = urlKey;
    }

    get apiUrl() {
        console.log(this.settings);
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
                // this is a non-cryptogaphic (!) hash, just used to e.g. decide whether we should
                // rerender a given graph...
                data.hash = hash(xhr.response);
                if (xhr.status >= 200 && xhr.status < 300) {
                    // setTimeout( () => resolve(data), 1000); // uncomment to add a delay for debugging
                    resolve(data);
                } else {
                    reject(data.error);
                }
            };
            xhr.onerror = () => {
                reject({
                    status: xhr.status,
                    message: xhr.statusText || 'request failed',
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
        let callParams;
        if (keyPair !== undefined) {
            const dataToSign = {
                ...params,
                timestamp: new Date().toISOString(),
            };
            const signedData = await sign(
                keyPair.privateKey,
                JSON.stringify(dataToSign),
                keyPair.publicKey
            );
            callParams = signedData;
        } else {
            callParams = params;
        }

        const result = await this.request({
            url: `${this.apiUrl}`,
            method: 'POST',
            json: {
                jsonrpc: '2.0',
                method: method,
                params: callParams,
                id: id,
            },
        });

        return result.result;
    }
}

export default JSONRPCBackend;
