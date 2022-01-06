import { useState, useEffect } from 'react';
import { User } from 'vanellus';
import { useBackend } from './use-backend';

const users: { [Key: string]: User } = {};

export const useUser = (name: string = 'main') => {
    const backend = useBackend();

    const [updated, setUpdated] = useState(0);

    if (!(name in users)) users[name] = new User(name, backend);

    useEffect(() => {
        const notify = (subject, ...args) => {
            setUpdated(updated + 1);
            console.log(subject, args);
        };
        const watcherId = users[name].watch(notify);
        return () => {
            console.log('unwatching');
            users[name].unwatch(watcherId);
        };
    }, []);

    return users[name];
};
