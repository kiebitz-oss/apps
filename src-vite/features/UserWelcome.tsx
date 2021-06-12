import React from 'react';
import Card from '../components/Card';
import { Button } from '../components/Button';

const UserWelcome = () => {
    return (
        <div className="container mx-auto 2xl:pt-24 pt-12 flex items-center justify-center flex-col">
            <Card className="lg:w-1/2 w-full lg:rounded-lg mb-4">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-2xl font-semibold mb-4">Was möchtest du tun?</h1>
                    <Button scheme="user" className="w-3/4 justify-center uppercase">
                        Anmelden
                    </Button>
                    <Button scheme="user" className="w-3/4 justify-center uppercase">
                        Registrieren
                    </Button>
                </div>
            </Card>
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
    );
};

export default UserWelcome;
