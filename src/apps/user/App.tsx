// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Routes, Route } from 'react-router';
import Setup from './setup';
import WelcomePage from './WelcomePage';
import Deleted from './deleted';
import LoggedOut from './logged-out';
import LogOut from './log-out';
import Dashboard from './dashboard';

export default function UserApp() {
    return (
        <Routes>
            <Route path="/deleted" element={<Deleted />} />
            <Route path="/log-out" element={<LogOut />} />
            <Route path="/logged-out" element={<LoggedOut />} />
            <Route path="/setup" element={<Setup />}>
                <Route path=":page" element={<Setup />} />
            </Route>
            <Route path="/appointments/:action" element={<Dashboard />} />
            <Route path="/appointments" element={<Dashboard />} />
            <Route index element={<WelcomePage />} />
        </Routes>
    );
}
