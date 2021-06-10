import React from 'react';
import { FaRegUserCircle } from 'react-icons/fa';

import { AppointmentSlot } from './AppointmentSlot';

const MedialOfficeAppointmentsDisplay = (props) => {
    const { name, street, number, zip, city, bookAppointment } = props;

    return (
        <div className="p-6 mb-8 bg-white rounded shadow-lg">
            <div className="flex mb-8">
                <div>
                    <FaRegUserCircle className="text-3xl text-brand-provider" />
                </div>
                <div className="flex flex-col ml-4">
                    <h6 className="mb-2">{name}</h6>
                    <p>
                        {street} {number}
                    </p>
                    <p>
                        {zip} {city}
                    </p>
                </div>
            </div>
            <div>
                {/* map for each available vaccine in the slot a SingleSlot component */}
                <AppointmentSlot
                    startTime={Date.now()}
                    endTime={Date.now() + 6000000}
                    vaccines={['AstraZeneca', 'BioNTech', 'Moderna']}
                    onClickVaccine={(vaccine) => bookAppointment(vaccine)}
                />
                <AppointmentSlot
                    startTime={Date.now() + 8000000}
                    endTime={Date.now() + 2 * 8000000}
                    vaccines={['BioNTech', 'Moderna']}
                    onClickVaccine={(vaccine) => bookAppointment(vaccine)}
                />
            </div>
        </div>
    );
};

export default MedialOfficeAppointmentsDisplay;
