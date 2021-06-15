// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
import settings from 'helpers/settings';

const KEY_BACKEND = 'backend';

export const getKeys = async (): Promise<any> => {
    const backend = settings.get(KEY_BACKEND);
    const keys = await backend.appointments.getKeys();

    for (const providerKeys of keys.lists.providers) {
        providerKeys.json = JSON.parse(providerKeys.data);
    }
    for (const mediatorKeys of keys.lists.mediators) {
        mediatorKeys.json = JSON.parse(mediatorKeys.data);
    }

    return keys;
};
