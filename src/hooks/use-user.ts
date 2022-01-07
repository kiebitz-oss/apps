import { User } from 'vanellus';
import { useBackend } from './use-backend';
import { watch } from './helpers';

const users: { [Key: string]: User } = {};

export const useUser = (
    {
        name,
        attributes,
    }: {
        name: string;
        attributes?: string[];
    } = { name: 'main' }
) => {
    const backend = useBackend();
    if (!(name in users)) users[name] = new User(name, backend);
    watch(users[name], attributes);
    return users[name];
};
