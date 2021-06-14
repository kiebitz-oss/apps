import { initUserSecret, setUserSecret } from '../../kiebitz/user/user-secret';

const useUserSecret = (): [string, (secret: string) => void] => {
    return [initUserSecret(), setUserSecret];
};

export default useUserSecret;
