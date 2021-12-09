// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Routes, Route } from 'react-router';
import Dashboard from './dashboard';
import WelcomePage from './WelcomePage';
import LogOut from './log-out';
import Setup from './setup';

export default function ProviderApp() {
    return (
        <Routes>
            <Route path="/log-out" element={<LogOut />} />

            <Route path="/setup">
                <Route path=":page/:status" element={<Setup />} />
                <Route path=":page" element={<Setup />} />
                <Route index element={<Setup />} />
            </Route>

            <Route
                path="/:tab/:action/:secondaryAction/:id"
                element={<Dashboard />}
            />
            <Route
                path="/:tab/:action/:secondaryAction"
                element={<Dashboard />}
            />
            <Route path="/:tab/:action" element={<Dashboard />} />
            <Route path="/:tab" element={<Dashboard />} />

            <Route path="/" element={<WelcomePage />} />
        </Routes>
    );
}
