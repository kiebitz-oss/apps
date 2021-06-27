import React, { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { FaRegCheckCircle } from 'react-icons/fa';
import Card from '../components/Card';
import { getUserInvitationAccepted } from '@/kiebitz/user/invitation';
import useUserSecret from '@/hooks/useUserSecret';
import ProviderDisplay from '@/components/ProviderDisplay';
import { getReadableVaccine, getSlotFromOffer } from '../utils/slots';
import { getReadableDateFromDate, getReadableTimeFromDate } from '../utils/intl';
import FeatureHeading from '@/components/FeatureHeading';

const UserAppointmentStatusFeature: React.FC = () => {
    const [userSecret] = useUserSecret();

    const [invitation, setInvitation] = useState<any>();
    useEffect(() => {
        const _invitation = getUserInvitationAccepted();
        setInvitation(_invitation);
    }, []);

    const { name, description, street, zipCode, city, website, accessible } =
        invitation?.invitation?.provider?.json ?? {};
    const slot = invitation?.offer ? getSlotFromOffer(invitation?.offer) : null;

    return (
        <>
            <FeatureHeading
                title="Buchungsstatus"
                desc="Hier kannst du einige Dinge über deine Buchung sehen und diese auch stornieren."
            />
            <div className="container mx-auto min-h-screen 2xl:pt-24 py-12 2xl:w-1/4 lg:w-1/2">
                <Card className="lg:rounded-lg">
                    <Alert type="success" className="flex items-center justify-center flex-col rounded-lg mb-6">
                        <FaRegCheckCircle className="h-12 w-12 mb-4" />
                        <p>Deine Buchung war erfolgreich!</p>
                    </Alert>
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold mb-2">Dein Buchungscode</h1>
                        <div className="rounded-xl bg-red-600 text-white flex items-center justify-center p-8">
                            <p className="text-4xl font-semibold tracking-widest">
                                {userSecret.slice(0, 4).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold mb-2">Wann?</h1>
                        <p>
                            {slot && getReadableDateFromDate(slot.date)}
                            {slot && getReadableTimeFromDate(slot.date)}
                        </p>
                        <p>{slot && getReadableVaccine(slot.vaccines[0])}</p>
                        {slot && `Dauer: ${slot.duration} Minuten`}
                    </div>
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold mb-2">Wo?</h1>
                        <ProviderDisplay
                            name={name}
                            desc={description}
                            street={street}
                            zip={zipCode}
                            city={city}
                            isAccessible={accessible}
                            website={website}
                        />
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
        </>
    );
};

export default UserAppointmentStatusFeature;
