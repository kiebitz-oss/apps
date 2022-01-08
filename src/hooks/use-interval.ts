import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number) {
    const savedCallback = useRef<() => void>();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (savedCallback.current === undefined) return;
            savedCallback.current();
        }
        if (delay !== null) {
            tick();
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
