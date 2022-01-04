import { Provider } from 'vanellus';
import { useBackend } from './use-backend';

const providers: {[Key: string]: Provider} = {};

export const useProvider = (name = 'main') => {
    const backend = useBackend();

    if (!(name in providers)) providers[name] = new Provider(name, backend);

    return providers[name];
};