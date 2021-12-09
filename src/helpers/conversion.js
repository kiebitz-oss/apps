// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// https://gist.github.com/Glamdring/04eacabae3188dd5978241183b4d4bc5
export function buf2hex(buffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('');
}

// we use all digits and alphabetic characters except o, l, 1 & 0 (as they can be easily confused)
const b32 = 'abcdefghijkmnpqrstuvwxyz23456789';
// converts a buffer to our base-32 representation
export function buf2base32(buffer) {
    const array = new Uint8Array(buffer);
    let base32 = '';
    let pos = 0;
    while (true) {
        const b = Math.floor(pos / 8);
        if (b >= array.length) break;
        let v = (array[b] >> pos % 8) & 31;
        // this number wraps into the next byte
        if (pos % 8 > 3 && b < array.length - 1)
            v |= (array[b + 1] & (0xff >> (11 - (pos % 8)))) << (8 - (pos % 8));
        base32 += b32[v];
        pos += 5;
    }
    // we check that the decoding works. For some buffer lengths values with
    // leading 0's don't convert properly. Technically we can also check that
    // the last bits are not producing an ambiguous result but checking the
    // decoding works as expected is a good idea anyway, so we just do that...
    const bb = base322buf(base32);
    if (bb.length != array.length) throw 'conversion error (length)';
    for (let i = 0; i < bb.length; i++)
        if (bb[i] != array[i]) throw 'conversion error (value)';
    return base32;
}

export function base322buf(base32) {
    const bytes = [];
    let pos = 0;
    let b = 0;
    base32 = base32
        .toLowerCase()
        .replace(/[^abcdefghijkmnpqrstuvwxyz23456789]/g, '');
    for (const c of base32) {
        const i = b32.indexOf(c);
        b |= (i << pos % 8) & 0xff;
        if (pos % 8 >= 3) {
            // this wraps into the next byte
            bytes.push(b);
            b = i >> (8 - (pos % 8));
        }
        pos += 5;
    }
    // we can't know if there's an additional 0 value, so we omit it if it's 0
    // that might be problematic for keys that actually have 0 values...
    if (pos - (5 % 8) > 3 && b != 0) bytes.push(b);
    return new Uint8Array(bytes);
}

export function hex2buf(hex) {
    const buffer = new ArrayBuffer(hex.length / 2);
    const array = new Uint8Array(buffer);
    let k = 0;
    for (let i = 0; i < hex.length; i += 2) {
        array[k] = parseInt(hex[i] + hex[i + 1], 16);
        k++;
    }
    return buffer;
}

export function str2ab(str) {
    const uint8array = new TextEncoder('utf-8').encode(str);
    return uint8array.buffer;
}

// https://gist.github.com/skratchdot/e095036fad80597f1c1a
export function ab2str(buf) {
    return new TextDecoder().decode(new Uint8Array(buf));
}

// https://stackoverflow.com/questions/421419/good-choice-for-a-lightweight-checksum-algorithm
export function adler32(buffer) {
    const MOD_ADLER = 65521;
    let a = 1,
        b = 0;

    const len = buffer.length;

    for (let i = 0; i < len; i++) {
        a += buffer[i];
        b += a;
    }

    a %= MOD_ADLER;
    b %= MOD_ADLER;

    const c = (b << 16) | a;

    return new Uint8Array([
        (c >> 24) & 0xff,
        (c >> 16) & 0xff,
        (c >> 8) & 0xff,
        c,
    ]);
}

export function append2buf(a, b) {
    const c = new Uint8Array(a.length + b.length);
    let i = 0;
    for (const n of a.values()) c[i++] = n;
    for (const n of b.values()) c[i++] = n;
    return c;
}

//https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
export function buf2b64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
export function b642buf(base64) {
    const bs = window.atob(base64);
    const len = bs.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = bs.charCodeAt(i);
    }
    return bytes.buffer;
}

export function getHexId(id) {
    return buf2hex(b642buf(id));
}
