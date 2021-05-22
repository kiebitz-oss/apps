// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React from 'react';
import { withActions } from './store';
import { displayName } from 'helpers/hoc';
import SettingsAction from 'actions/settings';
import { SettingsContext } from './contexts';

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
        props.externalSettingsActions.loadSettings(settings);
    }

    componentDidUpdate() {
        const { externalSettings, settings } = this.props;
        if (externalSettings.status !== 'failed') {
            this.props.externalSettingsActions.updateSettings(settings);
        }
    }

    render() {
        const { externalSettings } = this.props;
        if (externalSettings.status !== 'loaded') return <div />;
        return this.props.children;
    }
}

export const ExternalSettings = withActions(
    withSettings(ExtSettings),
    [SettingsAction],
    ['externalSettings']
);
