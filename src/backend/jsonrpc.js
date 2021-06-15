// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign } from 'helpers/crypto';
import { hash, urlEncode } from 'helpers/data';

function RPCException(result) {
    this.error = result.error;
    this.name = 'RPCException';
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
        const normalize = (data) => {
            if (data.errors === undefined) data.errors = {};
            return data;
        };

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const params = urlEncode(opts.params);
            xhr.open(opts.method, opts.url + (params !== null ? '?' + params : ''));

            xhr.onload = () => {
                const contentType = (xhr.getResponseHeader('content-type') || '').trim();
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
                    reject(data);
                }
            };
            xhr.onerror = () => {
                reject({
                    jsonrpc: '2.0',
                    id: '-1',
                    error: {
                        code: -1,
                        message: 'request failed',
                        data: {},
                    },
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
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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
            const signedData = await sign(keyPair.privateKey, JSON.stringify(dataToSign), keyPair.publicKey);
            callParams = signedData;
        } else {
            callParams = params;
        }

        try {
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
        } catch (result) {
            throw new RPCException(result);
        }
    }
}

export default JSONRPCBackend;
