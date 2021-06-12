import React from 'react';
import Alert from '../components/Alert';
import { FaRegCheckCircle } from 'react-icons/fa';

const UserAppointmentsSuccess = () => {
    return (
        <div className="container mx-auto 2xl:pt-24 pt-12">
            <Alert type="success" className="flex items-center justify-center flex-col mx-4 rounded-lg">
                <FaRegCheckCircle className="h-12 w-12 mb-4" />
                <p>Deine Buchung war erfolgreich!</p>
            </Alert>
        </div>
    );
};

export default UserAppointmentsSuccess;
