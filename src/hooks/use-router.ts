import { RouterContext } from 'components/contexts';
// @ts-ignore
import Router from 'helpers/routing';
import { useContext } from 'react';

export const useRouter = (): Router => {
    return useContext(RouterContext) as Router;
};
