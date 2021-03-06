// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Title, T } from 'components';
import t from './translations.yml';

const menu = new Map([
    [
        'hd',
        new Map([
            [
                'dashboard',
                {
                    title: (
                        <Title
                            title={<T t={t} k="drawingBoard" />}
                            icon="chalkboard"
                        />
                    ),
                    route: '',
                },
            ],
        ]),
    ],
    ['nav', new Map([])],
]);

export default menu;
