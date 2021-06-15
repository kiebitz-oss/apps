import React from 'react';
import { Route, Switch } from 'react-router-dom';

import './kiebitz/setup';

import DefaultLayout from './layouts/DefaultLayout';
import UserWelcome from './features/UserWelcome';
import UserWizard from './features/UserWizard';
import UserSlotsSelectionFeature from './features/UserSlotsSelectionFeature';
import UserAppointmentsSuccess from './features/UserAppointmentsSuccess';
import ProviderAppointmentCreate from './features/ProviderAppointmentCreate';

import './index.css';

const App = () => {
    return (
        <>
            <DefaultLayout entity="user">
                <Switch>
                    <Route path="/user/setup">
                        <UserWizard />
                    </Route>
                    <Route path="/user/appointments/success">
                        <UserAppointmentsSuccess />
                    </Route>
                    <Route path="/user/appointments">
                        <UserSlotsSelectionFeature />
                    </Route>
                    <Route path="/user/">
                        <UserWelcome />
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
