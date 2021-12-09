import { useBackend } from 'hooks';

export const useLock = async <R = unknown, P = unknown[]>(
    name: string,
    cb: (...params: P[]) => R
) => {
    const backend = useBackend();

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock(name);
    } catch (e) {
        throw null; // we throw a null exception (which won't affect the store state)
    }

    try {
        const data = await cb();

        return {
            status: 'succeeded',
            data: data,
        };
    } catch (error) {
        console.error(error);

        return {
            status: 'failed',
            error: error,
        };
    } finally {
        backend.local.unlock(name);
    }
};
