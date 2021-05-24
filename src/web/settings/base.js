// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { BrowserHistory, Router } from 'helpers/routing';
import Store from 'helpers/store';
import Settings from 'helpers/settings';

const history = new BrowserHistory();
const settings = new Settings([
    ['history', history],
    ['router', new Router(history)],
    ['store', new Store()],
]);

export default settings;
