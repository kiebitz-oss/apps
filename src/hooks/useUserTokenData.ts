import { useBackend } from 'hooks';

export const useUserTokenData = () => {
    const backend = useBackend();

    return backend.local.get('user::tokenData');
};
