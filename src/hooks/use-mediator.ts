import { Mediator } from 'vanellus';
import { useBackend } from './use-backend';

const mediators: { [Key: string]: Mediator } = {};

export const useMediator = (name: string = 'main'): Mediator => {
    const backend = useBackend();

    if (!(name in mediators)) mediators[name] = new Mediator(name, backend);

    return mediators[name];
};
