import React from 'react';
import Alert from '../components/Alert';
import { FaRegCheckCircle } from 'react-icons/fa';
import Card from '../components/Card';

const UserAppointmentsSuccess = () => {
    return (
        <div className="container mx-auto 2xl:pt-24 pt-12 flex justify-center">
            <Card className="lg:w-1/2">
                <Alert type="success" className="flex items-center justify-center flex-col rounded-lg">
                    <FaRegCheckCircle className="h-12 w-12 mb-4" />
                    <p>Deine Buchung war erfolgreich!</p>
                </Alert>
                <div className="mt-8">
                    <h1 className="text-xl font-semibold mb-2">Wie geht es jetzt weiter?</h1>
                    <p className="mb-4">
                        Deinen persönlichen Buchungscode für Deinen Impftermin bekommst per Mail zugeschickt.
                    </p>
                    <p className="mb-2">
                        Wenn Du die E-Mail Bestätigung bekommen hast, sei pünktlich bei dem jeweiligen Arzt/der
                        jeweiligen Ärztin und halte dort folgende Dokumente bereit:
                    </p>
                    <ul>
                        <li>Deine Buchungsbestätigung (reicht auf dem Handy)</li>
                        <li>Personalausweis oder Reisepass</li>
                        <li>Impfpass (sofern vorhanden), alternativ bekommst Du eine Impfbestätigung</li>
                        <li>Herzpass, Diabetikerausweis oder Medikamentenliste (sofern vorhanden)</li>
                        <li>Krankenkassenkarte (sofern vorhanden)</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default UserAppointmentsSuccess;
