// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { withActions } from './store';
import { displayName } from 'helpers/hoc';
import SettingsAction from 'actions/settings';
import { SettingsContext } from 'contexts';

export function withSettings(Component) {
    class Settings extends React.Component {
        static contextType = SettingsContext;

        render() {
            return <Component {...this.props} settings={this.context} />;
        }
    }

    Settings.displayName = `WithSettings(${displayName(Component)})`;

    return Settings;
}

export const Settings = ({ children, settings }) => (
    <SettingsContext.Provider value={settings}>
        {children}
    </SettingsContext.Provider>
);

class ExtSettings extends React.Component {
    constructor(props) {
        super(props);
        const { settings } = props;
        this.mounted = false;
        props.externalSettingsActions.loadSettings(settings);
    }

    componentDidUpdate() {
        const { externalSettings, settings } = this.props;
        if (externalSettings.status !== 'failed') {
            this.props.externalSettingsActions.updateSettings(settings);
        }
    }

    componentDidMount() {
        const { externalSettingsActions, settings } = this.props;

        const updateSettings = () => {
            if (!this.mounted) return;
            externalSettingsActions.loadSettings(settings);
            setTimeout(updateSettings, 60000);
        };

        setTimeout(updateSettings, 60000);

        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }
    render() {
        const { externalSettings } = this.props;
        if (externalSettings.status === 'initialized') return <div />;
        return this.props.children;
    }
}

export const ExternalSettings = withActions(
    withSettings(ExtSettings),
    [SettingsAction],
    ['externalSettings']
);
