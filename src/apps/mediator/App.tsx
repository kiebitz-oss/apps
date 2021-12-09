// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Routes, Route } from 'react-router';
import Dashboard from './dashboard';
import LoggedOut from './logged-out';

export default function MediatorApp() {
    return (
        <Routes>
            <Route path="/logged-out" element={<LoggedOut />} />
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
            <Route path="/" element={<Dashboard />} />
        </Routes>
    );
}
