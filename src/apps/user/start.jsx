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
import { CenteredCard, CardContent, A, T } from 'components';
import t from './translations.yml';
import './start.scss';

export default () => (
    <CenteredCard className="kip-cm-welcome">
        <CardContent>
            <h1 className="bulma-subtitle">
                <T t={t} k="what-to-do" />
            </h1>
            <ul className="kip-cm-selector">
                <li>
                    <A href="/user/setup">
                        <T t={t} k="printable-qr-codes" />
                    </A>
                </li>
                <li>
                    <A href="/user/restore">
                        <T t={t} k="load-settings" />
                    </A>
                </li>
                <li>
                    <A href="/user/help">
                        <T t={t} k="show-help" />
                    </A>
                </li>
            </ul>
        </CardContent>
    </CenteredCard>
);
