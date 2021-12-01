// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Store from 'helpers/store';
import Settings from 'helpers/settings';

const settings = new Settings([['store', new Store()]]);

export default settings;
