import { getUserTemporaryQueueData, UserQueueData } from '@/kiebitz/user/queue';

const useUserQueueData = (): [UserQueueData] => {
    return [getUserTemporaryQueueData()];
};

export default useUserQueueData;
