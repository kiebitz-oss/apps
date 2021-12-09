// Appointment is created by
export type Appointment = {
    id: string;
    duration: number;
    maxOverlap: number;
    timestamp: number;
    bookings: any[];
};
