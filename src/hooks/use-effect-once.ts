import { useEffect, useState } from 'react';

export function useEffectOnce(f: () => () => void) {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        return f();
    });
}
