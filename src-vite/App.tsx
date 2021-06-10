import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { UserLayout } from './components/UserLayout';
import { ProviderAppointmentCreate } from './features/ProviderAppointmentCreate';
import UserAppointments from './features/UserAppointments';
import { UserWizard } from './features/UserWizard';
import './index.css';

const App = () => {
    return (
        <div>
            <UserLayout>
                <Switch>
                    <Route path="/user/setup">
                        <UserWizard />
                    </Route>
                    <Route path="/provider/appointments/create">
                        <ProviderAppointmentCreate />
                    </Route>
                    <Route path="/user/appointments">
                        <UserAppointments />
                    </Route>
                </Switch>
            </UserLayout>
        </div>
    );
};

export default App;
