// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import ReactDOM from 'react-dom';
import App from 'main/app';
import {
    Store,
    Router,
    MainErrorBoundary,
    Settings,
    ExternalSettings,
} from 'components';
import Backend, { LocalStorageStore, SessionStorageStore } from 'backend';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import 'scss/main.scss';

const appElement = document.getElementById('app');

i18n.activate('de');

export const render = settings => {
    if (settings.get('backend') === undefined) {
        const backend = new Backend(
            settings,
            new LocalStorageStore(),
            new SessionStorageStore()
        );

        settings.set('backend', backend);
    }

    // Set the lang attribute on <html> for accessibility
    document.documentElement.setAttribute('lang', settings.lang());
    settings.get('router').init(settings.get('routes'));
    ReactDOM.render(
        <Settings settings={settings}>
            <Router router={settings.get('router')}>
                <MainErrorBoundary>
                    <Store store={settings.get('store')}>
                        <ExternalSettings>
                            <I18nProvider i18n={i18n}>
                                <App menu={settings.get('menu')} />
                            </I18nProvider>
                        </ExternalSettings>
                    </Store>
                </MainErrorBoundary>
            </Router>
        </Settings>,
        appElement
    );
};

