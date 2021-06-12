import React from 'react';
import { HeroTitle } from '../components/HeroTitle';
import MedicalOffice from '../components/MedialOfficeAppointmentsDisplay';

const bookAppointment = (data: any) => {
    console.log(data);
};

const UserAppointments = () => {
    return (
        <div className="container mx-auto 2xl:pt-24 pt-12">
            <HeroTitle title="Aktuelle Impfangebote" className="mx-auto 2xl:mb-24 mb-12" />
            <div className="grid grid-cols-1 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-8 p-4">
                <MedicalOffice
                    name="Praxis Dr. Vanessa Sonders"
                    street="Altdorferstraße"
                    number="18"
                    zip="80686"
                    city="München"
                    bookAppointment={(data) => bookAppointment(data)}
                    appointments={[]}
                />
                <MedicalOffice
                    name="Gemeinschaftspraxis Oliver Mayer"
                    street="Schleißheimer Str."
                    number="24"
                    zip="80339"
                    city="München"
                    bookAppointment={(data) => bookAppointment(data)}
                    appointments={[]}
                />
            </div>
        </div>
    );
};

export default UserAppointments;
