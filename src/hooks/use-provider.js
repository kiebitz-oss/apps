import { Provider } from 'vanellus';
import { useContext } from 'react';
import { useBackend } from './use-backend';

const providers = {};

export const useProvider = (name = 'main') => {
    const backend = useBackend();

    if (!(name in providers)) providers[name] = new Provider(name, backend);

    return providers[name];
};
