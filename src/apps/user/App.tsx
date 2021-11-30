import { Routes, Route } from 'react-router';
import React from 'react';

import Setup from './setup';
import Start from './start';
import Restore from './restore';
import Deleted from './deleted';
import LoggedOut from './logged-out';
import Dashboard from './dashboard';

import 'scss/main.scss';

export default function UserApp() {
    return (
        <Routes>
            <Route path="/restore" element={<Restore />} />
            <Route path="/deleted" element={<Deleted />} />
            <Route path="/logged-out" element={<LoggedOut />} />
            <Route path="/setup/:page" element={<Setup />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/:tab/:action" element={<Dashboard />} />
            <Route path="/:tab" element={<Dashboard />} />
            <Route index element={<Start />} />
        </Routes>
    );
}
