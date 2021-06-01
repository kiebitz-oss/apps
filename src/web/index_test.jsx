// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

/* eslint-env node */
import { render } from './index_common';
import settings from 'web/settings/test';

import Backend from 'testing/backend';
import { LocalStorageStore, SessionStorageStore } from 'backend';

// by default we use the local testing backend (will be overwritten in the
// production or development settings)
const backend = new Backend(
    settings,
    new LocalStorageStore(),
    new SessionStorageStore()
);

settings.set('backend', backend);

render(settings);

if (module.hot) {
    module.hot.accept(() => {
        render(settings);
    });
}
