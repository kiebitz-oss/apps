import settings, { Settings } from '@/settings';
import Backend, { LocalStorageStore, SessionStorageStore } from '@/backend';

const backend = new Backend(settings, new LocalStorageStore(), new SessionStorageStore());

settings.update(new Settings([['backend', backend]]));
