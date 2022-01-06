import { Settings, Backend, StorageStore } from 'vanellus';
import { useSettings } from './';

let backend: Backend;

export const useBackend = (): Backend => {
    const kbSettings = useSettings();

    if (backend === undefined) {
        const settings: Settings = {
            apiUrls: {
                appointments: kbSettings.get('appointmentsApi') as string,
                storage: kbSettings.get('storageApi') as string,
            },
            appointment: {
                properties: {},
            },
        };

        const store = new StorageStore(localStorage);
        const temporaryStore = new StorageStore(sessionStorage);
        backend = new Backend(settings, store, temporaryStore);
    }
    return backend;
};
