// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import settings, { Settings } from 'helpers/settings';
import Store from 'helpers/store';
import { BrowserHistory, Router } from 'helpers/routing';

const history = new BrowserHistory();

settings.update(
    new Settings([
        ['history', history],
        ['router', new Router(history)],
        ['store', new Store()],
    ])
);

export default settings;
