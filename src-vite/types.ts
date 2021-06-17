export type Entity = 'user' | 'provider' | 'mediator';

export type Vaccine = 'biontech' | 'astra-zeneca' | 'johnson-and-johnson' | 'moderna';

export interface Slot {
    id: string;
    date: Date;
    vaccines: Vaccine[];
    duration: number;
}
