import { Mediator } from 'vanellus';
import { useContext } from 'react';
import { useBackend } from './use-backend';

const mediators = {}

export const useUser = (name = 'main') => {

    const backend = useBackend();

    if (!(name in mediators))
        mediators[name] = new Mediator(name, backend);

    return mediators[name]
};