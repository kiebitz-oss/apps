import { useState, useEffect } from 'react';
import { User, Actor } from 'vanellus';
import { useBackend } from './use-backend';

const users: { [Key: string]: User } = {};

export function watch(actor: Actor, attributes?: string[]) {
    const [updated, setUpdated] = useState(0);

    useEffect(() => {
        const notify = (_: Actor, key: string) => {
            if (attributes && !attributes.find((k) => k === key)) return;
            setUpdated(updated + 1);
        };
        const watcherId = actor.watch(notify);
        return () => {
            actor.unwatch(watcherId);
        };
    }, []);
}

export const useUser = ({
    name = 'main',
    attributes,
}: {
    name: string;
    attributes?: string[];
}) => {
    const backend = useBackend();
    if (!(name in users)) users[name] = new User(name, backend);
    watch(users[name], attributes);
    return users[name];
};
