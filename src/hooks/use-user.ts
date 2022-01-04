import { User } from 'vanellus';
import { useBackend } from './use-backend';

const users: {[Key: string]: User} = {}

export const useUser = (name: string = 'main') => {

    const backend = useBackend();

    if (!(name in users))
        users[name] = new User(name, backend);

    return users[name]
};