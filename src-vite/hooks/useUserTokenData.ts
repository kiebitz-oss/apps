import { getUserTokenData } from '@/kiebitz/user/token-data';

const useUserTokenData = (): [any] => {
    return [getUserTokenData()];
};

export default useUserTokenData;
