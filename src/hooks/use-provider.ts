import { Provider } from 'vanellus';
import { useBackend } from './use-backend';
import { watch } from './helpers';

const providers: { [Key: string]: Provider } = {};

export const useProvider = (
    {
        name,
        attributes,
    }: {
        name: string;
        attributes?: string[];
    } = { name: 'main' }
) => {
    const backend = useBackend();
    if (!(name in providers)) providers[name] = new Provider(name, backend);
    watch(providers[name], attributes);
    return providers[name];
};
