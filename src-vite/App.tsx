import React from 'react';
import { Route, Switch } from 'react-router-dom';

import './kiebitz/setup';

import DefaultLayout from './layouts/DefaultLayout';
import UserWelcomeFeature from './features/UserWelcomeFeature';
import UserProfileFeature from './features/UserProfileFeature';
import UserSlotsSelectionFeature from './features/UserSlotsSelectionFeature';
import UserAppointmentStatusFeature from './features/UserAppointmentStatusFeature';
import ProviderAppointmentCreate from './features/ProviderAppointmentCreate';

import './index.css';

const App = () => {
    return (
        <>
            <DefaultLayout entity="user">
                <Switch>
                    <Route path="/user/setup">
                        <UserProfileFeature />
                    </Route>
                    <Route path="/user/appointments/status">
                        <UserAppointmentStatusFeature />
                    </Route>
                    <Route path="/user/appointments">
                        <UserSlotsSelectionFeature />
                    </Route>
                    <Route path="/user/">
                        <UserWelcomeFeature />
                    </Route>
                    <Route path="/provider/appointments/create">
                        <ProviderAppointmentCreate />
                    </Route>
                </Switch>
            </DefaultLayout>
        </>
    );
};

export default App;
