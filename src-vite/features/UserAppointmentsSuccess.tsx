import React, { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { FaRegCheckCircle } from 'react-icons/fa';
import Card from '../components/Card';
import { getUserInvitationAccepted } from '@/kiebitz/user/invitation';
import useUserSecret from '@/hooks/useUserSecret';

const UserAppointmentsSuccess = () => {
    const [userSecret] = useUserSecret();

    const [invitation, setInvitation] = useState<any>();
    useEffect(() => {
        const _invitation = getUserInvitationAccepted();
        setInvitation(_invitation);
    }, []);

    console.log(invitation);

    return (
        <div className="container mx-auto 2xl:pt-24 pt-12 flex justify-center">
            <Card className="lg:w-1/2">
                <Alert type="success" className="flex items-center justify-center flex-col rounded-lg mb-6">
                    <FaRegCheckCircle className="h-12 w-12 mb-4" />
                    <p>Deine Buchung war erfolgreich!</p>
                </Alert>
                <div className="mb-4">
                    <h1 className="text-2xl font-bold mb-2">Wo?</h1>
                    <pre>{JSON.stringify(invitation?.invitation?.provider?.json, null, 2)}</pre>
                </div>
                <div className="mb-4">
                    <h1 className="text-2xl font-bold mb-2">Was?</h1>
                    <pre>{JSON.stringify(invitation?.offer, null, 2)}</pre>
                </div>
                <div className="mb-4">
                    <h1 className="text-2xl font-bold mb-2">Wie?</h1>
                    <pre>{JSON.stringify({ code: userSecret.slice(0, 4).toUpperCase() }, null, 2)}</pre>
                </div>

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
