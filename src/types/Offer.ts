import { Slot } from './Slot';

export type Offer = {
    id: string;
    duration: number;
    properties: Record<string, string>;
    publicKey: string;
    slotData: Slot[];
    timestamp: string;
};
