import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const useUserAppointmentsShortcut = (userSecret: string, userTokenData: any) => {
    const history = useHistory();

    useEffect(() => {
        const hasCompletedSetup = userSecret && userTokenData;
        if (hasCompletedSetup) {
            history.push('/user/appointments');
        }
    }, [userSecret, userTokenData]);
};

export default useUserAppointmentsShortcut;
