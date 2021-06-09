import settings from 'helpers/settings';

export const KEY_USER_QUEUE_DATA = 'user::queueData';

export const getUserTemporaryQueueData = async (): Promise<any> => {
    const backend = settings.get('backend');
    return backend.temporary.get(KEY_USER_QUEUE_DATA);
};

export const setUserTemporaryQueueData = async (data: any): Promise<any> => {
    const backend = settings.get('backend');
    backend.temporary.set(KEY_USER_QUEUE_DATA, data);
};
