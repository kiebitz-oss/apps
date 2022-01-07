import { useState, useEffect } from 'react';
import { Actor } from 'vanellus';

export function watch(actor: Actor, attributes?: string[]) {
    const [updated, setUpdated] = useState(0);

    useEffect(() => {
        const notify = (_: Actor, key: string) => {
            if (attributes && !attributes.find((k) => k === key)) return;
            setUpdated(updated + 1);
        };
        const watcherId = actor.watch(notify);
        return () => {
            actor.unwatch(watcherId);
        };
    }, []);
}
