import { Slot, Vaccine } from '@/types';

export const getSlotFromOffer = (offer: any): Slot => {
    const vaccines: Vaccine[] = [];

    for (const [key, value] of Object.entries(Vaccine)) {
        if (offer[value]) {
            vaccines.push(Vaccine[key]);
        }
    }

    return {
        id: offer.id,
        date: new Date(`${offer.date} ${offer.time}`),
        vaccines,
        duration: offer.duration,
    };
};

export const getReadableVaccine = (vaccine: Vaccine) => {
    switch (vaccine) {
        case Vaccine.COMIRNATY_BIONTECH_PFIZER:
            return 'Comirnaty (BioNTech/Pfizer)';
        case Vaccine.VAXZEVRIA_ASTRAZENECA:
            return 'Vaxzevria® (AstraZeneca)';
        case Vaccine.JANSSEN_JOHNSON_AND_JOHNSON:
            return 'Janssen® (Johnson & Johnson)';
        case Vaccine.COVID_19_VACCINE_MODERNA_MODERNA:
            return 'COVID-19 Vaccine Moderna® (Moderna)';
        default:
            return 'getReadableVaccine...💩';
    }
};
