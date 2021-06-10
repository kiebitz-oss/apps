// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Base from './base';

export default class Title extends Base {
    static get defaultKey() {
        return 'title';
    }

    setTitle(title: string | Array<string>) {
        const newTitle = Array.isArray(title) ? title.join(' ') : title;
        if (title instanceof Array) title = title.join(' ');
        if (typeof newTitle !== 'string') {
            return;
        }
        const oldTitle = this.get();
        if (oldTitle === newTitle) return;
        this.set(title);
        document.title = `${title} · Kiebitz`;
    }
}
