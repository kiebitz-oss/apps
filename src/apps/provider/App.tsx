import { Routes, Route } from 'react-router-dom';
import React from 'react';

import Dashboard from './dashboard';
import Start from './start';
import Restore from './restore';
import Deleted from './deleted';
import LoggedOut from './logged-out';
import Setup from './setup';

import 'scss/main.scss';

export default function ProviderApp() {
    return (
        <Routes>
            <Route path="/restore" element={<Restore />} />
            <Route path="/logged-out" element={<LoggedOut />} />
            <Route path="/deleted" element={<Deleted />} />
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

            <Route path="/" element={<Start />} />
        </Routes>
    );
}
