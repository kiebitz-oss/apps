// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

/* eslint-env node */
import { render } from './index_common';
import settings from 'web/settings/test';

render(settings);

if (module.hot) {
    module.hot.accept(() => {
        render(settings);
    });
}
