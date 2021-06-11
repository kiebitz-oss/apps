// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
import settings from 'helpers/settings';

// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
const KEY_BACKEND = 'backend';

export const KEY_USER_CONTACT_DATA = 'user::contactData';

export type ContactData = {
    email: string;
    code: string;
};

export const getUserContactData = async (): Promise<ContactData> => {
    const backend = settings.get(KEY_BACKEND);
    return backend.temporary.get(KEY_USER_CONTACT_DATA);
};

export const setUserContactData = async (data: ContactData): Promise<ContactData> => {
    const backend = settings.get(KEY_BACKEND);
    return backend.temporary.set(KEY_USER_CONTACT_DATA, data);
};
