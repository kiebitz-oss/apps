// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { useSettings } from 'hooks';

// eslint-disable-next-line no-unused-vars
export const T = ({
    t,
    k,
    safe,
    ...args
}: {
    k: string[] | string;
    t: { [Key: string]: any };
    safe?: boolean;
}) => {
    const settings = useSettings();
    const tv = settings.t(t, k, args);

    if (safe)
        return (
            <span
                dangerouslySetInnerHTML={{
                    __html: tv instanceof Array ? tv.join('') : tv,
                }}
            />
        );

    return <React.Fragment>{tv}</React.Fragment>;
};
