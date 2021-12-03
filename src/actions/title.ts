// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Base from './base';

export default class Title extends Base {
    static get defaultKey() {
        return 'title';
    }

    setTitle(title: string) {
        const oldTitle = this.get();
        //        if (title instanceof Array) title = title.join(' ');
        //        if (!(typeof title === 'string') && !(title instanceof String)) {
        //            return;
        //        }
        if (oldTitle === title) return;
        this.set(title);
        document.title = `${title} · Kiebitz`;
    }
}
