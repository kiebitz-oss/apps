import { useEffect, useState } from 'react';

const useURLHash = (): string => {
    const [hash, setHash] = useState<string>(window.location.hash);

    useEffect(() => {
        const handler = (event: HashChangeEvent) => {
            setHash((event.target as Window).location.hash);
        };

        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    });

    return hash;
};

export default useURLHash;
