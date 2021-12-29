import { Settings, Store, Backend, StorageStore } from 'vanellus'
import { useSettings } from './'

let backend

export const useBackend = () => {

    const kbSettings = useSettings()

    if (backend === undefined){

        const settings = {
            apiUrls: {
                appointments: kbSettings.get('appointmentsApi'),
                storage: kbSettings.get('storageApi'),
            }
        }

        const store: Store = new StorageStore(localStorage)
        const temporaryStore: Store = new StorageStore(sessionStorage)
        backend = new Backend(settings, store, temporaryStore)
    }
    return backend
};