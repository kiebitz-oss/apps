import settings from 'helpers/settings';

// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
const KEY_BACKEND = 'backend';

export type GetQueueVariables = {
    zipCode: string;
    radius: number;
};

export type GetQueueResponse = {
    id: string;
    name: string;
    publicKey: string;
    type: string;
};

export const getQueues = async (data: GetQueueVariables): Promise<Array<GetQueueResponse>> => {
    const backend = settings.get(KEY_BACKEND);
    return await backend.appointments.getQueues(data);
};
