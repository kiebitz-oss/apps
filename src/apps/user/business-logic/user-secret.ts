// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
import settings from '../../../helpers/settings';

import { randomBytes } from 'helpers/crypto';
import { buf2base32, b642buf } from 'helpers/conversion';

const KEY_BACKEND = 'backend';

export const KEY_USER_SECRET = 'user::secret';

export const setUserSecret = (data: any): void => {
    const backend = settings.get(KEY_BACKEND);
    backend.local.set(KEY_USER_SECRET, data);
};

export const getUserSecret = (): any => {
    const backend = settings.get(KEY_BACKEND);
    return backend.local.get(KEY_USER_SECRET);
};

export const initUserSecret = (): any => {
    const secret = getUserSecret();
    if (secret) {
        return secret;
    }

    const newSecret = buf2base32(b642buf(randomBytes(10)));
    setUserSecret(newSecret);
    return newSecret;
};
