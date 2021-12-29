import { User } from 'vanellus';
import { useContext } from 'react';
import { useBackend } from './use-backend';

const users = {}

export const useUser = (name = 'main') => {

    const backend = useBackend();

    if (!(name in users))
        users[name] = new User(name, backend);

    return users[name]
};