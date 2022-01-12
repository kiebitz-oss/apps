import React from 'react';

const PropertyTags = ({ appointment, verbose, tiny }) => {
    const props = Object.entries(appointment)
        .filter(([k, v]) => v === true)
        .map(([k, v]) => (
            <PropertyTag tiny={tiny} verbose={verbose} key={k} property={k} />
        ))
        .filter((p) => p !== undefined);
    return <>{props}</>;
};

const PropertyTag = ({ property, tiny, verbose }) => {
    const settings = useSettings();
    const lang = settings.get('lang');
    const properties = settings.get('appointmentProperties');
    for (const [category, values] of Object.entries(properties)) {
        const prop = values.values[property];
        if (prop !== undefined) {
            return (
                <span
                    key={property}
                    className={classNames('kip-tag', `kip-is-${property}`, {
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
                    className={classNames('kip-tag', `kip-is-${property}`, {
                        'kip-is-tiny': tiny,
                    })}
                >
                    {property}
                </span>
            );
        }
    }
};

export default PropertyTags;
