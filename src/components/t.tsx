// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import PropTypes from 'prop-types';
import { withSettings } from './settings';
import Settings from 'helpers/settings';

// eslint-disable-next-line no-unused-vars
const TBase = ({ t, k, safe, settings, ...args }: {k: string[], t: {[Key: string]: any}, safe?: boolean, settings: Settings}) => {
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

TBase.propTypes = {
    k: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    safe: PropTypes.bool,
    settings: PropTypes.shape({
        t: PropTypes.func.isRequired,
    }).isRequired,
    t: PropTypes.oneOfType([PropTypes.object]).isRequired,
};

export const T = withSettings(TBase);
