// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
import settings from 'helpers/settings';

// TODO: Should be defined and exported somewhere in settings, since it's a
// settings relevant key.
const KEY_BACKEND = 'backend';

export const KEY_USER_TOKEN_DATA = 'user::tokenData';

export const getUserTokenData = async (): Promise<any> => {
  const backend = settings.get(KEY_BACKEND);
  return backend.local.get(KEY_USER_TOKEN_DATA);
};
