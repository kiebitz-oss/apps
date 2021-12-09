import React from 'react';
import clsx from 'clsx';
import { useSettings } from 'hooks';

const PropertyTag: React.FC<any> = ({ property, tiny, verbose }) => {
    const settings = useSettings();
    const lang = settings.get('lang');
    const properties = settings.get('appointmentProperties');

    for (const [category, values] of Object.entries(properties)) {
        const prop = values.values[property];

        if (prop !== undefined) {
            return (
                <span
                    key={property}
                    className={clsx('kip-tag', `kip-is-${property}`, {
                        'kip-is-tiny': tiny,
                    })}
                >
                    {verbose ? prop[lang] : prop.tag[lang]}
                </span>
            );
        } else {
            return (
                <span
                    key={property}
                    className={clsx('kip-tag', `kip-is-${property}`, {
                        'kip-is-tiny': tiny,
                    })}
                >
                    {property}
                </span>
            );
        }
    }

    return null;
};

export const PropertyTags: React.FC<any> = ({ appointment, verbose, tiny }) => {
    const props = Object.entries(appointment)
        .filter(([k, v]) => v === true)
        .map(([k, v]) => (
            <PropertyTag tiny={tiny} verbose={verbose} key={k} property={k} />
        ))
        .filter((p) => p !== undefined);

    return <>{props}</>;
};
