import { Routes, Route } from 'react-router-dom';
import React from 'react';

import Dashboard from './dashboard';
import LoggedOut from './logged-out';

import 'scss/main.scss';

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
