import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const useUserSetupGuard = (userSecret, userTokenData) => {
    const history = useHistory();
    useEffect(() => {
        const hasNotCompletedSetupYet = !userSecret || !userTokenData;
        if (hasNotCompletedSetupYet) {
            history.replace('/user/setup');
        }
    }, [userSecret, userTokenData]);
};

export default useUserSetupGuard;
