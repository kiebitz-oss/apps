// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import App from 'apps/App';
import { Store, Settings, ExternalSettings } from 'components';
import Backend, { LocalStorageStore, SessionStorageStore } from 'backend';
import { de, en } from 'make-plural/plurals';

import { messages as deMessages } from 'locales/de/messages';
import { messages as enMessages } from 'locales/en/messages';
import { ErrorFallback } from 'apps/common/ErrorFallback';

const appElement = document.getElementById('app');

i18n.loadLocaleData({
    de: { plurals: de },
    en: { plurals: en },
});

i18n.load({
    de: deMessages,
    en: enMessages,
});

i18n.activate('de');

export const render = (settings) => {
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

    ReactDOM.render(
        <I18nProvider i18n={i18n}>
            <Settings settings={settings}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Store store={settings.get('store')}>
                        <ExternalSettings>
                            <App />
                        </ExternalSettings>
                    </Store>
                </ErrorBoundary>
            </Settings>
        </I18nProvider>,

        appElement
    );
};
