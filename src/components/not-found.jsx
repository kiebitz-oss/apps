// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { CenteredCard } from './card';
import { Message } from './message';
import { T } from './t';

import t from './translations.yml';

export const NotFound = () => {
    return (
        <CenteredCard>
            <Message type="warning">
                <T t={t} k="pageDoesNotExist" />
            </Message>
        </CenteredCard>
    );
};
