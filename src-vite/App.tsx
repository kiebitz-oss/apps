import React from 'react';
import { Route, Switch } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import UserAppointments from './features/UserAppointments';
import { UserWizard } from './features/UserWizard';
import UserAppointmentsSuccess from './features/UserAppointmentsSuccess';
import { ProviderAppointmentCreate } from './features/ProviderAppointmentCreate';

import './index.css';

const App = () => {
    return (
        <div>
            <DefaultLayout entity="user">
                <Switch>
                    <Route path="/user/setup">
                        <UserWizard />
                    </Route>
                    <Route path="/user/appointments/success">
                        <UserAppointmentsSuccess />
                    </Route>
                    <Route path="/user/appointments">
                        <UserAppointments />
                    </Route>
                    <Route path="/provider/appointments/create">
                        <ProviderAppointmentCreate />
                    </Route>
                </Switch>
            </DefaultLayout>
        </div>
    );
};

export default App;
