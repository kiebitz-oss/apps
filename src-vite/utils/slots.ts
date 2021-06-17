import { Slot, Vaccine } from '@/types';

// TODO: Actually map the available vaccines.
export const getSlotFromOffer = (offer: any): Slot => ({
    id: offer.id,
    date: new Date(`${offer.date} ${offer.time}`),
    vaccines: ['biontech'],
    duration: offer.duration,
});

export const getReadableVaccine = (vaccine: Vaccine) => {
    switch (vaccine) {
        case 'biontech':
            return 'Comirnaty (BioNTech/Pfizer)';
        case 'astra-zeneca':
            return 'Vaxzevria® (AstraZeneca)';
        case 'johnson-and-johnson':
            return 'Janssen® (Johnson & Johnson)';
        case 'moderna':
            return 'COVID-19 Vaccine Moderna® (Moderna)';
    }
};
