import { getUserInvitationAccepted, getUserInvitationVerified } from '@/kiebitz/user/invitation';

const useUserInvitation = () => {
    const data = getUserInvitationAccepted();
    console.log(data);

    const data2 = getUserInvitationVerified();
    console.log(data2);
};

export default useUserInvitation;
