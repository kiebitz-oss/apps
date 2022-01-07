import { Mediator } from 'vanellus';
import { useBackend } from './use-backend';
import { watch } from './helpers';

const mediators: { [Key: string]: Mediator } = {};

export const useMediator = (
    {
        name,
        attributes,
    }: {
        name: string;
        attributes?: string[];
    } = { name: 'main' }
) => {
    const backend = useBackend();
    if (!(name in mediators)) mediators[name] = new Mediator(name, backend);
    watch(mediators[name], attributes);
    return mediators[name];
};
