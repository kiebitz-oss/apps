export type Entity = 'user' | 'provider' | 'mediator';

export enum Vaccine {
    COMIRNATY_BIONTECH_PFIZER = 'biontech',
    VAXZEVRIA_ASTRAZENECA = 'astrazeneca',
    JANSSEN_JOHNSON_AND_JOHNSON = 'johnson-johnson',
    COVID_19_VACCINE_MODERNA_MODERNA = 'moderna',
}

export interface Slot {
    id: string;
    date: Date;
    vaccines: Vaccine[];
    duration: number;
    // TODO: These are confirmation relevant details that need to be typed.
    slotData: any;
    grants: any;
}
