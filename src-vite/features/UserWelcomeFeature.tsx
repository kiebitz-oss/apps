import React, { MouseEventHandler } from 'react';
import { useHistory } from 'react-router-dom';
import Card from '@/components/Card';
import { Button } from '@/components/Button';
import useUserAppointmentsShortcut from '@/hooks/useUserAppointmentsShortcut';
import useUserSecret from '@/hooks/useUserSecret';
import useUserTokenData from '@/hooks/useUserTokenData';

const UserWelcomeFeature: React.FC = () => {
    const [userSecret] = useUserSecret();
    const [userTokenData] = useUserTokenData();

    useUserAppointmentsShortcut(userSecret, userTokenData);

    const history = useHistory();
    const handleSignUpClick: MouseEventHandler<HTMLButtonElement> = () => {
        history.push('/user/setup');
    };

    const handleSignInClick: MouseEventHandler<HTMLButtonElement> = () => {
        console.error('No idea how to sign in.');
    };

    return (
        <>
            <div className="container mx-auto min-h-screen 2xl:w-1/4 lg:w-1/2 2xl:pt-12 py-6">
                <Card className="lg:rounded-lg mb-4">
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-2xl font-semibold mb-4">Was möchtest du tun?</h1>
                        <Button
                            scheme="user"
                            className="lg:w-1/2 w-3/4 justify-center uppercase"
                            onClick={handleSignInClick}
                        >
                            Anmelden
                        </Button>
                        <Button
                            scheme="user"
                            className="lg:w-1/2 w-3/4 justify-center uppercase"
                            onClick={handleSignUpClick}
                        >
                            Registrieren
                        </Button>
                    </div>
                </Card>
                <div className="text-center">
                    <span>
                        Bereits geimpft?{' '}
                        <a
                            className="text-brand-user hover:text-white"
                            href="https://google.de"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Hier austragen!
                        </a>
                    </span>
                </div>
            </div>
        </>
    );
};

export default UserWelcomeFeature;
