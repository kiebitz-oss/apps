// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { useSettings } from 'hooks';
import React, { Suspense } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import './app.scss';

const MediatorApp = React.lazy(
    () => import(/* webpackChunkName: "mediator-app" */ '../apps/mediator/App')
);
const ProviderApp = React.lazy(
    () => import(/* webpackChunkName: "provider-app" */ '../apps/provider/App')
);
const UserApp = React.lazy(
    () => import(/* webpackChunkName: "user-app" */ '../apps/user/App')
);

export default function App() {
    const settings = useSettings();

    return (
        <div className="kip-with-logo-wrapper">
            <div className="kip-logo-wrapper">
                <img className="kip-logo" src={settings.get('whiteLogo')} />
            </div>

            <Router>
                <Suspense fallback={<h1>Loading...</h1>}>
                    <Routes>
                        <Route
                            path="/mediator/*"
                            element={
                                <Suspense fallback={<h1>Loading...</h1>}>
                                    <MediatorApp />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/provider/*"
                            element={
                                <Suspense fallback={<h1>Loading...</h1>}>
                                    <ProviderApp />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/user/*"
                            element={
                                <Suspense fallback={<h1>Loading...</h1>}>
                                    <UserApp />
                                </Suspense>
                            }
                        />
                        <Route path="*" element={<Navigate to="/user" />} />
                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}
